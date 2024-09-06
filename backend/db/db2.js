const mongoose = require('mongoose');

const connectDb2 = mongoose.createConnection("mongodb+srv://anasskhoursa:Anas2004@cluster0.wofqw5z.mongodb.net/Candidates_tut?retryWrites=true&w=majority&appName=Cluster0", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

connectDb2.on('connected', () => {
  console.log("db2 connected");
});

connectDb2.on('error', (err) => {
  console.log("db2 connection error", err);
});

const CandidateSchema = new mongoose.Schema({
  name: {
    required: true,
    type: String
  },
  id: {
    required: true,
    type: Number
  },
  image: {
    required: true,
    type: String
  },
  QuarterFinalsVoteurs: [
    {
      badgeNumberVoter: {
        type: Number,
      },
      votedAt: {
        type: Date,
        default: Date.now,
      }
    }
  ],
  QuarterFinalsVoteurs2: [
    {
      badgeNumberVoter: {
        type: Number,
      },
      votedAt: {
        type: Date,
        default: Date.now,
      }
    }
  ],
  SemiFinalsVoteurs: [
    {
      badgeNumberVoter: {
        type: Number,
      },
      votedAt: {
        type: Date,
        default: Date.now,
      }
    }
  ],
  SemiFinalsVoteurs2: [
    {
      badgeNumberVoter: {
        type: Number,
      },
      votedAt: {
        type: Date,
        default: Date.now,
      }
    }
  ],
  FinalsVoteurs: [
    {
      badgeNumberVoter: {
        type: Number,
      },
      votedAt: {
        type: Date,
        default: Date.now,
      }
    }
  ],
  NumeroDeVoteq: {
    type: Number,

    default: 0
  },
  NumeroDeVoteq2: {
    type: Number,

    default: 0
  },
  NumeroDeVotes: {
    type: Number,

    default: 0
  },
  NumeroDeVotes2: {
    type: Number,

    default: 0
  },
  NumeroDeVotef: {
    type: Number,

    default: 0
  },
  QOrder: {
    type: Number,
    required:true
    
  }
}, { timestamps: true });

const VoteRoundSchema = new mongoose.Schema({
  isOpen: {
    required: true,
    type: Boolean,
    default: false
  },
  Round: {
    required: true,
    type: String,

  }

}, { timestamps: true });
const VoteResultsSchema = new mongoose.Schema({
  Round: {
    required: true,
    type: String,
  },
  Results: [
    {
      CandidateName: {
        required: true,
        type: String
      },
      CandidateID: {
        required: true,
        type: Number
      },
      image: {
        required: true,
        type: String
      },
      VoterBadgeNumber: {
        required: true,
        type: Number
      },
      votedAt: {
        required: true,
        type: Date
      }

    }
  ]

}, { timestamps: true });

const singers = connectDb2.model('candidates', CandidateSchema);
const VoteRound = connectDb2.model('Voting Round', VoteRoundSchema)
const VoteResults = connectDb2.model('Vote Results', VoteResultsSchema)


module.exports = { connectDb2, singers, VoteRound, VoteResults };
