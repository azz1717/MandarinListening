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
    loadAndRenderCurrentWeek();
    updateSidebarSelection();
  }
});

document.getElementById('next-week').addEventListener('click', () => {
  if (currentWeekIndex < weeks.length - 1) {
    currentWeekIndex++;
    loadAndRenderCurrentWeek();
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
      
      // IF THE IMAGE FAILS TO LOAD (File is missing)
      img.onerror = () => {
        btn.innerHTML = ''; // Remove the broken image icon
        btn.textContent = phrase.chinese; // Add the Chinese text
        
        // Revert the button styles back to normal
        btn.style.padding = '1.5rem 2rem';
        btn.style.border = ''; 
        btn.style.background = '';
        
        // Add your new fallback border class!
        btn.classList.add('fallback-btn');
      };

      btn.appendChild(img);

      // remove padding so image fills button
      btn.style.padding = '0';
      btn.style.border = 'none';
      btn.style.background = 'none';
      btn.style.cursor = 'pointer';
      
    } else {
      // If there is no image string in the JSON at all
      btn.textContent = phrase.chinese;
      btn.style.padding = '1.5rem 2rem'; 
      btn.classList.add('fallback-btn'); 
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


// A cache object to store term data once fetched, preventing duplicate network requests
const loadedTerms = {};

// load data (added cache prevention here too to ensure you always get the latest index.json)
fetch('index.json', { cache: "no-store" })
  .then(res => res.json())
  .then(data => {
    weeks = data.weeks;
    renderSidebar();
    loadAndRenderCurrentWeek();
  })
  .catch(err => {
    console.error("Failed to load index.json configuration", err);
  });

function loadAndRenderCurrentWeek() {
  const currentWeekMetadata = weeks[currentWeekIndex];
  const termFile = currentWeekMetadata.file;
  const weekNumber = currentWeekMetadata.week;

  // Scenario A: The term file is already loaded in memory
  if (loadedTerms[termFile]) {
    weeks[currentWeekIndex].phrases = loadedTerms[termFile].weeks[weekNumber].phrases;
    renderWeek();
    return;
  }

  // Scenario B: Fetch the term file for the first time
  fetch(`data/${termFile}`, { cache: "no-store" }) 
    .then(res => {
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return res.json();
    })
    .then(termData => {
      // Save the entire term data structure to our cache
      loadedTerms[termFile] = termData;
      
      // Safety check: verify the requested week exists in the downloaded data
      if (termData.weeks && termData.weeks[weekNumber]) {
        weeks[currentWeekIndex].phrases = termData.weeks[weekNumber].phrases;
        renderWeek();
      } else {
        console.error(`Week ${weekNumber} data missing inside data/${termFile}`);
      }
    })
    .catch(err => {
      console.error(`Failed to load data for Term ${currentWeekMetadata.term} Week ${weekNumber}`, err);
    });
}