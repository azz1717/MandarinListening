// script.js
let currentWeekIndex = 0;
let weeks = [];

const phraseContainer = document.getElementById('phrase-buttons');
const weekInfo = document.getElementById('week-info');
const modal = document.getElementById('info-modal');
const modalText = document.getElementById('modal-content-text');

document.getElementById('prev-week').addEventListener('click', () => {
  if (currentWeekIndex > 0) {
    currentWeekIndex--;
    renderWeek();
  }
});

document.getElementById('next-week').addEventListener('click', () => {
  if (currentWeekIndex < weeks.length - 1) {
    currentWeekIndex++;
    renderWeek();
  }
});

document.getElementById('close-modal').addEventListener('click', () => {
  modal.classList.add('hidden');
});

function renderWeek() {
  const week = weeks[currentWeekIndex];
  weekInfo.textContent = `Term ${week.term} - Week ${week.week}`;
  phraseContainer.innerHTML = '';

  week.phrases.forEach((phrase, index) => {
    const btn = document.createElement('button');
    btn.textContent = phrase.chinese;
    btn.addEventListener('click', () => {
      const audio = new Audio(`audio/${phrase.audio}`);
      audio.play();
    });

    const infoBtn = document.createElement('span');
		infoBtn.textContent = '❓';
		infoBtn.style.marginLeft = '8px';
		infoBtn.style.cursor = 'pointer';

		infoBtn.addEventListener('click', () => {
		  // Clear old content
		  document.getElementById('modal-pinyin').textContent = phrase.pinyin;
		  document.getElementById('modal-english').textContent = phrase.english;

		  // Show modal
		  document.getElementById('info-modal').classList.remove('hidden');
	});


    const wrapper = document.createElement('div');
    wrapper.appendChild(btn);
    wrapper.appendChild(infoBtn);
    phraseContainer.appendChild(wrapper);
  });
}

fetch('phrases.json')
  .then(res => res.json())
  .then(data => {
    weeks = data.weeks;
    renderWeek();
  });
