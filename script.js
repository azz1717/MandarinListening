let currentWeekIndex = 0;
let weeks = [];

const phraseContainer = document.getElementById('phrase-buttons');
const weekInfo = document.getElementById('week-info');
const modal = document.getElementById('info-modal');

// sidebar container
const termWeekPanel = document.getElementById('term-week-panel');

// navigation
document.getElementById('prev-week').addEventListener('click', () => {
  if (currentWeekIndex > 0) {
    currentWeekIndex--;
    renderWeek();
    updateSidebarSelection();
  }
});

document.getElementById('next-week').addEventListener('click', () => {
  if (currentWeekIndex < weeks.length - 1) {
    currentWeekIndex++;
    renderWeek();
    updateSidebarSelection();
  }
});

document.getElementById('close-modal').addEventListener('click', () => {
  modal.classList.add('hidden');
});

function renderSidebar() {
  termWeekPanel.innerHTML = '';

  weeks.forEach((week, index) => {
    const div = document.createElement('div');
    div.classList.add('week-item');

    const input = document.createElement('input');
    input.type = 'radio';
    input.name = 'week';
    input.id = `week${index}`;
    input.value = index;

    if (index === currentWeekIndex) input.checked = true;

    input.addEventListener('change', () => {
      currentWeekIndex = index;
      renderWeek();
    });

    const label = document.createElement('label');
    label.setAttribute('for', `week${index}`);
    label.textContent = `Term ${week.term} - Week ${week.week}`;

    div.appendChild(input);
    div.appendChild(label);
    termWeekPanel.appendChild(div);
  });
}

function updateSidebarSelection() {
  const radios = document.querySelectorAll('input[name="week"]');
  radios.forEach((radio, idx) => {
    radio.checked = idx === currentWeekIndex;
  });
}

function renderWeek() {
  const week = weeks[currentWeekIndex];
  weekInfo.textContent = `Term ${week.term} - Week ${week.week}`;
  phraseContainer.innerHTML = '';

  week.phrases.forEach((phrase) => {
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
      document.getElementById('modal-pinyin').textContent = phrase.pinyin;
      document.getElementById('modal-english').textContent = phrase.english;
      modal.classList.remove('hidden');
    });

    const wrapper = document.createElement('div');
    wrapper.appendChild(btn);
    wrapper.appendChild(infoBtn);
    phraseContainer.appendChild(wrapper);
  });
}

// load data
fetch('phrases.json')
  .then(res => res.json())
  .then(data => {
    weeks = data.weeks;
    renderSidebar();
    renderWeek();
  });
