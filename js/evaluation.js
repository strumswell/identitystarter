/**
 * All possible criterions
 */
const CriterionType = {
  FUNCTIONALITY: 0,
  FLEXIBILITY: 1,
  OPERABILITY: 2,
  DEPENDENCY: 3,
  INVOLVEMENT: 4,
};

/**
 * All possible sub criteria
 */
const CriterionSubtype = {
  FLOW_COVERAGE: 0,
  STANDARS: 1,
  EXTENSIBILITY: 2,
  DEPLOYMENT: 3,
  PLATFORM: 4,
  SUPPORT: 5,
  DOCUMENTATION: 6,
  MATURITY: 7,
  OVERHEAD: 8,
  KEYS: 9,
  STACK: 10,
  COST: 11,
  COMMUNITY: 12,
  PRODUCT: 13,
};

/**
 * Types of questions
 */
const QuestionType = {
  DOUBLE: 0,
  BOOL: 1,
  ENUM: 2,
};

/**
 * Supported SSI solutions
 */
const Solution = {
  VERAMO: 0,
  MATTR: 1,
  TRINSIC: 2,
  AZURE: 3,
};

/**
 * Class that holds a score for a question
 */
class QuestionScore {
  solution;
  value;

  /**
   *
   * @param {Solution} solution Which solution the score refers to
   * @param {Number} value The score a solution got for a particular question
   */
  constructor(solution, value) {
    this.solution = solution;
    this.value = value;
  }
}

/**
 * Class that holds all data concerning a questions
 */
class Question {
  criterionType; // Has no impact on functionality, but can be used in frontend for info
  criterionSubtype; // Has no impact on functionality, but can be used in frontend for info
  questionType; // Has no impact on functionality, but can be used in frontend for info
  options; // Has no impact on functionality, but can be used in frontend for info
  question; // Has no impact on functionality, but can be used in frontend for info
  score;

  /**
   *
   * @param {CriterionType} criterionType Type of criterion
   * @param {CriterionSubtype} criterionSubtype Subtype of criterion
   * @param {QuestionType} questionType  Type of question
   * @param {Array} options Optional: Options for ENUM questions
   * @param {string} question Question
   * @param {Array} score Array of QuestionScores
   */
  constructor(criterionType, criterionSubtype, questionType, options, question, score) {
    this.criterionType = criterionType;
    this.criterionSubtype = criterionSubtype;
    this.questionType = questionType;
    this.options = options;
    this.question = question;
    this.score = score;
  }
}

/**
 * Class that can be used to get a weighted evaluation for each solution over all questions
 */
class Evaluation {
  questions;
  weights;

  /**
   *
   * @param {[Question]} questions Array of all questions that should be used for evaluation
   */
  constructor(questions) {
    this.questions = questions;
    this.weights = {
      0: 0.2,
      1: 0.2,
      2: 0.2,
      3: 0.2,
      4: 0.2,
    };
  }

  /**
   * Set a new weight for a particular CriterionType
   * @param {CriterionType} criterionType Which CriterionType should be changed
   * @param {Number} weight The new weight
   */
  setWeight(criterionType, weight) {
    this.weights[criterionType] = weight;
  }

  /**
   * Get evaluation result
   * @returns {Object} Scores for each criertion and a weighted + normalized sum of all criteria
   */
  getScores() {
    let scores = {};

    // Sum and count all questions, sorted by CriterionType
    this.questions.forEach((q) => {
      let criterionType = Object.keys(CriterionType)[q.criterionType];

      // Criterion type already in scores?
      if (Object.keys(scores).includes(criterionType)) {
        // Loop through all scores of question
        q.score.forEach((s) => {
          let solutionType = Object.keys(Solution)[s.solution];
          // Solution already recorded in scores?
          if (scores[criterionType]["scores"]) {
            scores[criterionType]["scores"][solutionType] += s.value;
          } else {
            scores[criterionType]["scores"][solutionType] = s.value;
          }
        });

        scores[criterionType].questionCount += 1;
      } else {
        // Create new entries for criterion and solution types
        scores[criterionType] = {};
        scores[criterionType]["scores"] = {};
        q.score.forEach((s) => {
          let solutionType = Object.keys(Solution)[s.solution];
          scores[criterionType]["scores"][solutionType] = s.value;
          scores[criterionType].questionCount = 1;
        });
      }
    });

    // Normalize score for each solution
    let weightedNormSum = {};
    console.log(this.weights);
    Object.keys(scores).forEach((criterion) => {
      scores[criterion].normScores = {};
      Object.keys(scores[criterion].scores).forEach((solution) => {
        // Normalized score for criterion of solution
        scores[criterion]["normScores"][solution] =
          scores[criterion]["scores"][solution] / scores[criterion].questionCount;

        // Create normalized sum of all criteria over all solution
        if (weightedNormSum[solution]) {
          weightedNormSum[solution] +=
            scores[criterion]["normScores"][solution] * this.weights[CriterionType[criterion]];
        } else {
          weightedNormSum[solution] =
            scores[criterion]["normScores"][solution] * this.weights[CriterionType[criterion]];
        }
      });
    });

    // Restructure result...
    scores = {
      weightedNormSum: weightedNormSum,
      criteria: scores,
    };

    return scores;
  }
}
