import { quizData } from './quizData';

export function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

export function prepareQuiz(category, count = 10) {
    const raw = quizData[category] || [];
    // shallow clone and shuffle questions
    let questions = raw.map(q => ({ ...q, options: [...q.options] }));
    shuffleArray(questions);
    // limit to requested count
    questions = questions.slice(0, count);

    questions.forEach(q => {
        const optionsShuffled = [...q.options];
        shuffleArray(optionsShuffled);
        const correctOptionText = q.options[q.correct];
        q.shuffledOptions = optionsShuffled;
        q.shuffledCorrectIndex = optionsShuffled.indexOf(correctOptionText);
    });

    return questions;
}