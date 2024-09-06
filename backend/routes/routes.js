const { addUser, Login, GetCandidates, verifyToken, PostCandidates, PostCandidate, UpdateQVote, findCandidateByQVoter, FindVoters, GetUsers,  UpdateVotingRound, StartVotingRound, FinishVotingRound, getRoundStatus, ResetVotableStatus, VoteResults, SetVotableStatusQ, SetVotableStatusS, SetVotableStatusF, SetVotableStatusQ2, SetVotableStatusS2, VoteResultsq, VoteResultsq2, VoteResultsS, VoteResultsS2, VoteResultsf, ModifyCandidate, DeleteCandidate, ResetPassword, ResetVote, GetPassword, ResetAllPasswords } = require('../controllers/controllers');

const router = require('express').Router()


router.post('/add-user', addUser);
router.post('/login', Login);
router.get('/get-candidates', GetCandidates);
router.post('/post-candidates', PostCandidates);
router.post('/post-candidate', PostCandidate);
router.put('/put-qvote', UpdateQVote);


router.post('/find-qvotedsinger', findCandidateByQVoter);
router.get('/votedsingers', FindVoters);
router.get('/get-users', GetUsers);
router.put('/start-round', StartVotingRound);
router.put('/finish-round', FinishVotingRound);
router.get('/get-rounds', getRoundStatus);
router.post('/set-votableq', SetVotableStatusQ);
router.post('/set-votableq2', SetVotableStatusQ2);

router.post('/set-votables', SetVotableStatusS);
router.post('/set-votables2', SetVotableStatusS2);

router.post('/set-votablef', SetVotableStatusF);

router.post('/reset-votable', ResetVotableStatus);
router.get('/ult_faceaface_loser', VoteResultsq);
router.get('/ult_faceaface_loser2', VoteResultsq2);
router.get('/demi_losers', VoteResultsS);
router.get('/demi_losers2', VoteResultsS2);
router.get('/Final_Losers', VoteResultsf);

router.post('/modify-candidate', ModifyCandidate);
router.post('/delete-candidate', DeleteCandidate);
router.post('/reset-password', ResetPassword);

router.get('/test', (req, res) => {res.send('hello')});
router.post('/reset-votes', ResetVote)
router.post('/get-password', GetPassword)
router.post('/reset-passwords', ResetAllPasswords)



router.get('/Merci', verifyToken, (req, res) => {
    res.status(200).json({ message: 'Welcome to Merci Page!', user: req.user });
})


module.exports={router}