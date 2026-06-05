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

  // 1. Group the weeks by Term, while remembering their original "global" index
  const groupedTerms = [];
  weeks.forEach((week, index) => {
    // Check if we already have a group for this term
    let group = groupedTerms.find(g => g.term === week.term);
    if (!group) {
      group = { term: week.term, items: [] };
      groupedTerms.push(group);
    }
    // Add the week to its term group, saving the index so Next/Prev still works!
    group.items.push({ weekData: week, globalIndex: index });
  });

  // 2. Build the collapsible UI for each group
  groupedTerms.forEach(group => {
    // Create the collapsible container
    const details = document.createElement('details');
    details.classList.add('term-group');
    
    // Create the clickable header
    const summary = document.createElement('summary');
    summary.textContent = `Term: ${group.term}`;
    details.appendChild(summary);

    const groupDiv = document.createElement('div');
    groupDiv.classList.add('term-items');

    // Add all the weeks into this group's div
    group.items.forEach(({ weekData, globalIndex }) => {
      const div = document.createElement('div');
      div.classList.add('week-item');

      const input = document.createElement('input');
      input.type = 'radio';
      input.name = 'week';
      input.id = `week${globalIndex}`;
      input.value = globalIndex;

      // If this is the current week, open the folder automatically!
      if (globalIndex === currentWeekIndex) {
        input.checked = true;
        details.open = true; 
      }

      input.addEventListener('change', () => {
        currentWeekIndex = globalIndex;
        loadAndRenderCurrentWeek();
      });

      const label = document.createElement('label');
      label.setAttribute('for', `week${globalIndex}`);
      // Cleaned up the text since the Term is already in the header
      label.textContent = `Week ${weekData.week}`; 

      div.appendChild(input);
      div.appendChild(label);
      groupDiv.appendChild(div);
    });

    details.appendChild(groupDiv);
    termWeekPanel.appendChild(details);
  });
}

function updateSidebarSelection() {
  const radios = document.querySelectorAll('input[name="week"]');
  radios.forEach((radio, idx) => {
    radio.checked = (idx === currentWeekIndex);
    
    // If we click "Next" and it jumps to a new Term folder, auto-open that folder!
    if (idx === currentWeekIndex) {
      const parentDetails = radio.closest('details');
      if (parentDetails) {
        parentDetails.open = true;
      }
    }
  });
}

function renderWeek() {
  const week = weeks[currentWeekIndex];
  weekInfo.textContent = `Term ${week.term} - Week ${week.week}`;
  phraseContainer.innerHTML = '';

	week.phrases.forEach((phrase) => {
		const btn = document.createElement('button');
		
		// Just set the text! No image logic needed at all.
		btn.textContent = phrase.chinese;

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
		  let pinyinContent = phrase.pinyin;
		  
		  if (phrase.sandhi && phrase.sandhi !== phrase.pinyin) {
			pinyinContent += `<br><span style="color: green;">${phrase.sandhi}</span>`;
		  }
		  
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