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
      loadAndRenderCurrentWeek();
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

    if (phrase.image) {
      const img = document.createElement('img');
      img.src = `images/${phrase.image}`;
      img.alt = phrase.chinese;
      img.style.width = '100%';
      img.style.height = 'auto';
      img.style.display = 'block';
      btn.appendChild(img);

      // remove padding so image fills button
      btn.style.padding = '0';
      btn.style.border = 'none';
      btn.style.background = 'none';
      btn.style.cursor = 'pointer';
    } else {
      btn.textContent = phrase.chinese;
      btn.style.padding = '1.5rem 2rem'; // keep original padding for text buttons
    }

    btn.addEventListener('click', () => {
      if (phrase.audio) {
        const audio = new Audio(`audio/${phrase.audio}`);
        audio.play();
      }
    });

    const infoBtn = document.createElement('span');
    infoBtn.textContent = '❓';
    infoBtn.style.marginLeft = '8px';
    infoBtn.style.cursor = 'pointer';

    infoBtn.addEventListener('click', () => {
      // Start with the default pinyin
      let pinyinContent = phrase.pinyin;
      
      // Check if sandhi exists and is different from the original pinyin
      if (phrase.sandhi && phrase.sandhi !== phrase.pinyin) {
        // Append the sandhi in green (added a line break for cleaner formatting)
        pinyinContent += `<br><span style="color: green;">${phrase.sandhi}</span>`;
      }
      
      // Use innerHTML instead of textContent so the HTML span tag renders properly
      document.getElementById('modal-pinyin').innerHTML = pinyinContent;
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
// 1. Fetch the manifest file first
fetch('index.json')
  .then(res => res.json())
  .then(data => {
    weeks = data.weeks; // Stores the metadata array containing file paths
    renderSidebar();
    loadAndRenderCurrentWeek(); // New function to handle split-file loading
  });

// 2. New helper function to handle asynchronous fetching per week
function loadAndRenderCurrentWeek() {
  const currentWeekMetadata = weeks[currentWeekIndex];
  
  // If we already fetched the phrases for this week previously, don't fetch again
  if (currentWeekMetadata.phrases) {
    renderWeek();
    return;
  }

  // Fetch the specific week's file dynamically
  fetch(`data/${currentWeekMetadata.file}`)
    .then(res => res.json())
    .then(weekData => {
      // Attach the fetched phrases to our local weeks array cache
      weeks[currentWeekIndex].phrases = weekData.phrases;
      renderWeek();
    })
    .catch(err => {
      console.error(`Failed to load data for Term ${currentWeekMetadata.term} Week ${currentWeekMetadata.week}`, err);
    });
}
