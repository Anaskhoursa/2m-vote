const { users } = require("../db/db");
const bcrypt = require('bcrypt');
const { singers, VoteRound, VoteResults } = require("../db/db2");
const jwt = require('jsonwebtoken');
const generateAccessToken = require("../jwt/generateToken");
const upload = require("../multer/multer");


/*exports.addUser = async (req, res) => {
    let { name, password, BadgeNumber, email, phone } = req.body;
    let user = users({
        name,
        password,
        BadgeNumber,
        email,
        phone
    })
    const existingUser = await users.findOne({ BadgeNumber: BadgeNumber });
    if (existingUser) {
        return res.status(400).json({ message: 'User already exists. Please choose a different Badge Number.' })
    }
    else {
        
        user = users({
            name,
            password,
            BadgeNumber,
            email,
            phone
        })
        await user.save();
        res.status(200).json({ message: 'user added' });
    }
}*/
exports.addUser = async (req, res) => {
    try {
        upload.single('image')(req, res, async (err) => {
            if (err) {
                return res.status(500).json({ message: err });
            }
            let picture = ''
            if (req.file) {
                picture = req.file.path;
            }

            const { name, password, BadgeNumber, email, phone, ville, secteur } = req.body;

            let user = users({
                name,
                password,
                BadgeNumber,
                email,
                phone,
                picture,
                ville,
                secteur
            })
            const existingUser = await users.findOne({ BadgeNumber: BadgeNumber });
            if (existingUser) {
                return res.status(200).json({ message: 'User already exists. Please choose a different Badge Number.' })
            }
            await user.save();

            res.status(200).json({ message: 'user added' });
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.Login = async (req, res) => {
    const { BadgeNumber, password } = req.body;
    const check = await users.findOne({ BadgeNumber: BadgeNumber });
    if (!check) {
        return res.status(400).json({ message: 'Badge Number not found' })
    }

    if (password !== check.password) {
        return res.status(400).json({ message: 'Wrong password' });

    }
    else {
        const accessToken = generateAccessToken(check)
        return res.status(200).json({ message: 'Login successful', accessToken: accessToken });
    }

}
exports.GetUsers = async (req, res) => {
    try {
        const Users = await users.find();
        res.status(200).json({ message: Users });
    } catch (error) {
        res.status(500).json({ message: 'server error' })
    }
}
exports.GetCandidates = async (req, res) => {
    try {
        const candidates = await singers.find().sort({ id: 1 })
        res.status(200).json(candidates)
    }
    catch (err) {
        res.status(500).json({ message: 'server error' })
    }
}
exports.PostCandidate = async (req, res) => {
    try {
        const { name, id, image, QOrder } = req.body;
        let candidate = singers({
            name,
            id,
            image,
            QOrder
        })
        await candidate.save()
        res.status(200).json({ message: 'candidate saved' })
    }
    catch (err) {
        res.status(500).json({ message: err.message })
    }
}
exports.PostCandidates = async (req, res) => {
    try {
        const candidates = req.body;
        if (!Array.isArray(candidates)) {
            return res.status(400).json({ message: "Invalid data format" });
        }

        const savedCandidates = await singers.insertMany(candidates);
        res.status(200).json({ message: 'Candidates saved', savedCandidates });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.UpdateQVote = async (req, res) => {
    try {
        const { BadgeNumber, id, RoundVoters } = req.body;
        const voterInfo = {
            badgeNumberVoter: BadgeNumber,
            votedAt: new Date()
        };

        const updateObject = {};
        updateObject[RoundVoters] = voterInfo;

        await singers.updateOne(
            { id: id },
            { $push: updateObject }
        );

        res.status(200).json({ message: 'vote added' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


exports.findCandidateByQVoter = async (req, res) => {
    try {
        const { BadgeNumber, Round } = req.body;
        let singer;
        if (Round === "Quarter Finals") {
            singer = await singers.findOne({ 'QuarterFinalsVoteurs.badgeNumberVoter': BadgeNumber }, 'id name image NumeroDeVoteq');
        }
        else if (Round === "Quarter Finals v2") {
            singer = await singers.findOne({ 'QuarterFinalsVoteurs2.badgeNumberVoter': BadgeNumber }, 'id name image NumeroDeVoteq2');
        }

        else if (Round === "Semi Finals") {
            singer = await singers.findOne({ 'SemiFinalsVoteurs.badgeNumberVoter': BadgeNumber }, 'id name image NumeroDeVotes');

        }
        else if (Round === "Semi Finals v2") {
            singer = await singers.findOne({ 'SemiFinalsVoteurs2.badgeNumberVoter': BadgeNumber }, 'id name image NumeroDeVotes2');
        }
        else if (Round === "Finals") {
            singer = await singers.findOne({ 'FinalsVoteurs.badgeNumberVoter': BadgeNumber }, 'id name image NumeroDeVotef');

        }
        res.status(200).json({ message: singer });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

exports.FindVoters = async (req, res) => {
    try {
        const VotedSingers = await singers.find().sort({ id: 1 })
        res.status(200).json({ message: VotedSingers })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

exports.getRoundStatus = async (req, res) => {
    try {
        const response = await VoteRound.find()
        res.status(200).json({ message: response })
    } catch (error) {
        res.status(500).json({ message: error.message })

    }
}
exports.StartVotingRound = async (req, res) => {
    try {
        const { VotingRound } = req.body;
        const cand = await singers.find();
        if (VotingRound === "Quarter Finals") {
            if (cand.filter(candidate => candidate.NumeroDeVoteq !== 0).length >= 8) {
                await VoteRound.updateMany({ $set: { isOpen: false } })
                await VoteRound.updateOne({ Round: VotingRound }, { $set: { isOpen: true } })
                res.status(200).json({ message: "success" })
            }
            else (
                res.status(400).json({ message: "not enough candidates" })
            )
        }
        if (VotingRound === "Quarter Finals v2") {
            if (cand.filter(candidate => candidate.NumeroDeVoteq2 !== 0).length >= 0) {
                await VoteRound.updateMany({ $set: { isOpen: false } })
                await VoteRound.updateOne({ Round: VotingRound }, { $set: { isOpen: true } })
                res.status(200).json({ message: "success" })
            }
            else (
                res.status(400).json({ message: "not enough candidates" })
            )
        }
        if (VotingRound === "Semi Finals") {
            if (cand.filter(candidate => candidate.NumeroDeVotes !== 0).length >= 10) {
                await VoteRound.updateMany({ $set: { isOpen: false } })
                await VoteRound.updateOne({ Round: VotingRound }, { $set: { isOpen: true } })
                res.status(200).json({ message: "success" })
            }
            else (
                res.status(400).json({ message: "not enough candidates" })
            )
        }
        if (VotingRound === "Semi Finals v2") {
            if (cand.filter(candidate => candidate.NumeroDeVotes2 !== 0).length >= 0) {
                await VoteRound.updateMany({ $set: { isOpen: false } })
                await VoteRound.updateOne({ Round: VotingRound }, { $set: { isOpen: true } })
                res.status(200).json({ message: "success" })
            }
            else (
                res.status(400).json({ message: "not enough candidates" })
            )
        }
        if (VotingRound === "Finals") {
            if (cand.filter(candidate => candidate.NumeroDeVotef !== 0).length >= 5) {
                await VoteRound.updateMany({ $set: { isOpen: false } })
                await VoteRound.updateOne({ Round: VotingRound }, { $set: { isOpen: true } })
                res.status(200).json({ message: "success" })
            }
            else (
                res.status(400).json({ message: "not enough candidates" })
            )
        }


    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}
exports.FinishVotingRound = async (req, res) => {
    try {
        const { VotingRound } = req.body;
        await VoteRound.updateMany({ $set: { isOpen: false } })
        res.status(200).json({ message: "success" })
    } catch (error) {
        res.status(200).json({ message: error.message })
    }
}
exports.SetVotableStatusQ = async (req, res) => {
    try {
        const { QOrder, Round } = req.body;
        if (Round === "Quarter Finals") {
            if (QOrder === 1) {
                await singers.updateOne({ QOrder: QOrder }, { $set: { NumeroDeVoteq: 1 } })
                await singers.updateOne({ QOrder: 2 }, { $set: { NumeroDeVoteq: 0 } })

            }
            else if (QOrder === 2) {
                await singers.updateOne({ QOrder: QOrder }, { $set: { NumeroDeVoteq: 1 } })
                await singers.updateOne({ QOrder: 1 }, { $set: { NumeroDeVoteq: 0 } })
            }
            else if (QOrder === 3) {
                await singers.updateOne({ QOrder: QOrder }, { $set: { NumeroDeVoteq: 2 } })
                await singers.updateOne({ QOrder: 4 }, { $set: { NumeroDeVoteq: 0 } })

            }
            else if (QOrder === 4) {
                await singers.updateOne({ QOrder: QOrder }, { $set: { NumeroDeVoteq: 2 } })
                await singers.updateOne({ QOrder: 3 }, { $set: { NumeroDeVoteq: 0 } })
            }
            else if (QOrder === 5) {
                await singers.updateOne({ QOrder: QOrder }, { $set: { NumeroDeVoteq: 3 } })
                await singers.updateOne({ QOrder: 6 }, { $set: { NumeroDeVoteq: 0 } })

            }
            else if (QOrder === 6) {
                await singers.updateOne({ QOrder: QOrder }, { $set: { NumeroDeVoteq: 3 } })
                await singers.updateOne({ QOrder: 5 }, { $set: { NumeroDeVoteq: 0 } })
            }
            else if (QOrder === 7) {
                await singers.updateOne({ QOrder: QOrder }, { $set: { NumeroDeVoteq: 4 } })
                await singers.updateOne({ QOrder: 8 }, { $set: { NumeroDeVoteq: 0 } })

            }
            else if (QOrder === 8) {
                await singers.updateOne({ QOrder: QOrder }, { $set: { NumeroDeVoteq: 4 } })
                await singers.updateOne({ QOrder: 7 }, { $set: { NumeroDeVoteq: 0 } })
            }
            else if (QOrder === 9) {
                await singers.updateOne({ QOrder: QOrder }, { $set: { NumeroDeVoteq: 5 } })
                await singers.updateOne({ QOrder: 10 }, { $set: { NumeroDeVoteq: 0 } })

            }
            else if (QOrder === 10) {
                await singers.updateOne({ QOrder: QOrder }, { $set: { NumeroDeVoteq: 5 } })
                await singers.updateOne({ QOrder: 9 }, { $set: { NumeroDeVoteq: 0 } })
            }
            else if (QOrder === 11) {
                await singers.updateOne({ QOrder: QOrder }, { $set: { NumeroDeVoteq: 6 } })
                await singers.updateOne({ QOrder: 12 }, { $set: { NumeroDeVoteq: 0 } })

            }
            else if (QOrder === 12) {
                await singers.updateOne({ QOrder: QOrder }, { $set: { NumeroDeVoteq: 6 } })
                await singers.updateOne({ QOrder: 11 }, { $set: { NumeroDeVoteq: 0 } })
            }
            else if (QOrder === 13) {
                await singers.updateOne({ QOrder: QOrder }, { $set: { NumeroDeVoteq: 7 } })
                await singers.updateOne({ QOrder: 14 }, { $set: { NumeroDeVoteq: 0 } })

            }
            else if (QOrder === 14) {
                await singers.updateOne({ QOrder: QOrder }, { $set: { NumeroDeVoteq: 7 } })
                await singers.updateOne({ QOrder: 13 }, { $set: { NumeroDeVoteq: 0 } })
            }
            else if (QOrder === 15) {
                await singers.updateOne({ QOrder: QOrder }, { $set: { NumeroDeVoteq: 8 } })
                await singers.updateOne({ QOrder: 16 }, { $set: { NumeroDeVoteq: 0 } })

            }
            else if (QOrder === 16) {
                await singers.updateOne({ QOrder: QOrder }, { $set: { NumeroDeVoteq: 8 } })
                await singers.updateOne({ QOrder: 15 }, { $set: { NumeroDeVoteq: 0 } })
            }
        }


        res.status(200).json({ message: "success" })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}
exports.SetVotableStatusQ2 = async (req, res) => {
    try {
        const candidates = req.body;

        if (!Array.isArray(candidates)) {
            return res.status(400).json({ error: 'Invalid data format. Expected an array of candidates.' });
        }

        await singers.updateMany({ $set: { NumeroDeVoteq2: 0 } });

        for (let i = 0; i < candidates.length; i++) {
            const candidate = candidates[i];
            await singers.updateOne({ id: candidate.id }, { $set: { NumeroDeVoteq2: i + 1 } });
        }

        res.status(200).json({ message: 'Candidates order updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.SetVotableStatusS = async (req, res) => {
    try {
        console.log(req.body);
        const candidates = req.body;

        if (!Array.isArray(candidates)) {
            return res.status(400).json({ error: 'Invalid data format. Expected an array of candidates.' });
        }

        await singers.updateMany({ $set: { NumeroDeVotes: 0 } });

        for (let i = 0; i < candidates.length; i++) {
            const candidate = candidates[i];
            await singers.updateOne({ id: candidate.id }, { $set: { NumeroDeVotes: i + 1 } });
        }

        res.status(200).json({ message: 'Candidates order updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.SetVotableStatusS2 = async (req, res) => {
    try {
        const candidates = req.body;

        if (!Array.isArray(candidates)) {
            return res.status(400).json({ error: 'Invalid data format. Expected an array of candidates.' });
        }

        await singers.updateMany({ $set: { NumeroDeVotes2: 0 } });

        for (let i = 0; i < candidates.length; i++) {
            const candidate = candidates[i];
            await singers.updateOne({ id: candidate.id }, { $set: { NumeroDeVotes2: i + 1 } });
        }

        res.status(200).json({ message: 'Candidates order updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


exports.SetVotableStatusF = async (req, res) => {
    try {
        const candidates = req.body;

        await singers.updateMany({ $set: { NumeroDeVotef: 0 } });

        for (let i = 0; i < candidates.length; i++) {
            const candidate = candidates[i];
            await singers.updateOne({ id: candidate.id }, { $set: { NumeroDeVotef: i + 1 } });
        }

        res.status(200).json({ message: 'Candidates order updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.ResetVotableStatus = async (req, res) => {
    try {
        const { QOrder } = req.body;
        await singers.updateOne({ QOrder: QOrder }, { $set: { NumeroDeVoteq: 0 } })
        res.status(200).json({ message: "success" })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}
exports.VoteResultsq = async (req, res) => {
    try {
        const response = await singers.find();
        let quarterVotes = [];

        let totalq = [];

        response.forEach(i => {
            if (i.QuarterFinalsVoteurs.length !== 0) {
                i.QuarterFinalsVoteurs.forEach(voter => {
                    quarterVotes.push({
                        CandidateName: i.name,
                        CandidateID: i.id,
                        image: i.image,
                        VoterBadgeNumber: voter.badgeNumberVoter,
                        votedAt: voter.votedAt,
                    });
                });
            }

        });

        quarterVotes.sort((a, b) => new Date(a.votedAt) - new Date(b.votedAt));


        await VoteResults.updateOne({ Round: "Quarter Finals" }, { $set: { Results: quarterVotes } });

        quarterVotes.slice(0, 100)
        const candidates = await singers.find();
        candidates.filter(candidate => candidate.NumeroDeVoteq !== 0).forEach(candidate => {
            let count = quarterVotes.filter(vote => vote.CandidateID === candidate.id).length;
            totalq.push({
                id: candidate.id,
                name: candidate.name,
                image: candidate.image,
                votecount: count,
            })
        })


        totalq.sort((a, b) => b.votecount - a.votecount);

        res.status(200).json(totalq);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.VoteResultsq2 = async (req, res) => {
    try {
        const response = await singers.find();

        let quarterVotes2 = [];

        let totalq2 = [];

        response.forEach(i => {

            if (i.QuarterFinalsVoteurs2.length !== 0) {
                i.QuarterFinalsVoteurs2.forEach(voter => {
                    quarterVotes2.push({
                        CandidateName: i.name,
                        CandidateID: i.id,
                        image: i.image,
                        VoterBadgeNumber: voter.badgeNumberVoter,
                        votedAt: voter.votedAt,
                    });
                });
            }
        });

        quarterVotes2.sort((a, b) => new Date(a.votedAt) - new Date(b.votedAt));

        await VoteResults.updateOne({ Round: "Quarter Finals v2" }, { $set: { Results: quarterVotes2 } });

        quarterVotes2.slice(0, 100)

        const candidates = await singers.find();

        candidates.filter(candidate => candidate.NumeroDeVoteq2 !== 0).forEach(candidate => {
            let count = quarterVotes2.filter(vote => vote.CandidateID === candidate.id).length;
            totalq2.push({
                id: candidate.id,
                name: candidate.name,
                image: candidate.image,
                votecount: count,
            })
        })


        totalq2.sort((a, b) => b.votecount - a.votecount);

        res.status(200).json(totalq2);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.VoteResultsS = async (req, res) => {
    try {
        const response = await singers.find();

        let semiVotes = [];

        let totals = [];

        response.forEach(i => {

            if (i.SemiFinalsVoteurs.length !== 0) {
                i.SemiFinalsVoteurs.forEach(voter => {
                    semiVotes.push({
                        CandidateName: i.name,
                        CandidateID: i.id,
                        image: i.image,
                        VoterBadgeNumber: voter.badgeNumberVoter,
                        votedAt: voter.votedAt,
                    });
                });
            }
        });

        semiVotes.sort((a, b) => new Date(a.votedAt) - new Date(b.votedAt));

        await VoteResults.updateOne({ Round: "Semi Finals" }, { $set: { Results: semiVotes } });

        semiVotes.slice(0, 100)

        const candidates = await singers.find();

        candidates.filter(candidate => candidate.NumeroDeVotes !== 0).forEach(candidate => {
            let count = semiVotes.filter(vote => vote.CandidateID === candidate.id).length;
            totals.push({
                id: candidate.id,
                name: candidate.name,
                image: candidate.image,
                votecount: count,
            })
        })


        totals.sort((a, b) => b.votecount - a.votecount);

        res.status(200).json(totals);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.VoteResultsS2 = async (req, res) => {
    try {
        const response = await singers.find();

        let semiVotes2 = [];

        let totals2 = [];



        response.forEach(i => {


            if (i.SemiFinalsVoteurs2.length !== 0) {
                i.SemiFinalsVoteurs2.forEach(voter => {
                    semiVotes2.push({
                        CandidateName: i.name,
                        CandidateID: i.id,
                        image: i.image,
                        VoterBadgeNumber: voter.badgeNumberVoter,
                        votedAt: voter.votedAt,
                    });
                });
            }

        });

        semiVotes2.sort((a, b) => new Date(a.votedAt) - new Date(b.votedAt));
        await VoteResults.updateOne({ Round: "Semi Finals v2" }, { $set: { Results: semiVotes2 } });

        semiVotes2.slice(0, 100)
        const candidates = await singers.find();

        candidates.filter(candidate => candidate.NumeroDeVotes2 !== 0).forEach(candidate => {
            let count = semiVotes2.filter(vote => vote.CandidateID === candidate.id).length;
            totals2.push({
                id: candidate.id,
                name: candidate.name,
                image: candidate.image,
                votecount: count,
            })
        })


        totals2.sort((a, b) => b.votecount - a.votecount);

        res.status(200).json(totals2);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.VoteResultsf = async (req, res) => {
    try {
        const response = await singers.find();

        let finalVotes = [];

        let totalf = [];

        response.forEach(i => {

            if (i.FinalsVoteurs.length !== 0) {
                i.FinalsVoteurs.forEach(voter => {
                    finalVotes.push({
                        CandidateName: i.name,
                        CandidateID: i.id,
                        image: i.image,
                        VoterBadgeNumber: voter.badgeNumberVoter,
                        votedAt: voter.votedAt,
                    });
                });
            }
        });


        finalVotes.sort((a, b) => new Date(a.votedAt) - new Date(b.votedAt));



        await VoteResults.updateOne({ Round: "Finals" }, { $set: { Results: finalVotes } });

        finalVotes.slice(0, 100)
        const candidates = await singers.find();

        candidates.filter(candidate => candidate.NumeroDeVotef !== 0).forEach(candidate => {
            let count = finalVotes.filter(vote => vote.CandidateID === candidate.id).length;
            totalf.push({
                id: candidate.id,
                name: candidate.name,
                image: candidate.image,
                votecount: count,
            })
        })

        totalf.sort((a, b) => b.votecount - a.votecount);

        res.status(200).json(totalf);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.ModifyCandidate = async (req, res) => {
    try {
        const { _id, id, image, name, QOrder } = req.body;
        await singers.updateOne({ _id: _id }, { $set: { id: id, image: image, name: name, QOrder: QOrder } })
        res.status(200).json({ message: "success" })
    } catch (error) {
        res.status(500).json({ message: error.message })

    }
}
exports.DeleteCandidate = async (req, res) => {
    try {
        const { id } = req.body;
        await singers.deleteOne({ id: id })
        res.status(200).json({ message: 'deleted' })
    } catch (error) {
        res.status(500).json({ message: error.message })

    }
}
exports.ResetPassword = async (req, res) => {
    try {
        const { _id, resetPassword } = req.body;
        await users.updateOne({ _id: _id }, { $set: { password: resetPassword } })
        res.status(200).json({ message: 'success' })


    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}
exports.ResetVote = async (req, res) => {
    try {
        const { Round } = req.body
        if (Round === "Quarter Finals") {
            await singers.updateMany({ $set: { QuarterFinalsVoteurs: [] } })
            res.status(200).json({ message: 'success' })
        }
        if (Round === "Quarter Finals v2") {
            await singers.updateMany({ $set: { QuarterFinalsVoteurs2: [] } })
            res.status(200).json({ message: 'success' })
        }
        if (Round === "Semi Finals") {
            await singers.updateMany({ $set: { SemiFinalsVoteurs: [] } })
            res.status(200).json({ message: 'success' })
        }
        if (Round === "Semi Finals v2") {
            await singers.updateMany({ $set: { SemiFinalsVoteurs2: [] } })
            res.status(200).json({ message: 'success' })
        }
        if (Round === "Finals") {
            await singers.updateMany({ $set: { FinalsVoteurs: [] } })
            res.status(200).json({ message: 'success' })
        }
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}
exports.GetPassword = async (req, res) => {
    try {
        const { _id } = req.body;
        const password = await users.findOne({ _id: _id }, 'password')
        res.status(200).json({ message: password })
    } catch (error) {
        res.status(500).json({ message: error.message })

    }
}
exports.ResetAllPasswords = async (req, res) => {
    try {
        const { resetPassword } = req.body
        await users.updateMany({ password: resetPassword })
        res.status(200).json({ message: 'success' })
    } catch (error) {
        res.status(200).json({ message: error.message })

    }
}

exports.verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Access token not found' });
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Token expired or invalid' });
        }
        req.user = user;
        next();
    });
};



