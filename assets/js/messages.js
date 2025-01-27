loadCSSAsync('./assets/css/messages.css');
loadCSSAsync('./assets/css/animations.css');
  
const project_repo = 'https://github.com/CoolerWithHeat/';
const thankfulness = "We're truly grateful for your support and trust in our products.";

async function loadCSSAsync(url) {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = url;

  return new Promise((resolve, reject) => {
      link.onload = () => resolve(`CSS loaded: ${url}`);
      link.onerror = () => reject(new Error(`Failed to load CSS: ${url}`));
      document.head.appendChild(link);
  });
}

function openURL(url) {
    if (url && typeof url === 'string') {
        sourceSuggestion(false);
        setTimeout(() => {
          window.open(url, '_blank');
        }, 799);
    } else {
        console.error('Invalid URL provided');
    }
}

function messageStructure(text){
  return `
    <div class="message-positive rightSideAppear">
        <div class="message-header">
          <h1 class="headerText">Thank You!</h1>
        </div>
        <div class="message-lifespan"></div>
        <div class="textContainer">
          <p class="message-text">
            ${text}
          </p>
        </div>
    </div>`;
};

function exposeMessage({message}){
  const messageWindow = document.getElementById('MessageWindow');
  if(messageWindow){
    messageWindow.innerHTML = messageStructure(message);
    setTimeout(() => {
        messageWindow.innerHTML = '';
    }, 4099);
  };
};

function suggestionStructure(){
  return `
      <div id="SourceSuggestion" class="message-request">
        <div class="message-header">
          <h1 class="headerText">Attention!</h1>
        </div>
        <div class="request">
          <div class="requestHeader">
            <h4>Want To See Source Code?</h4>
          </div>
          <div class="requestActions">
              <div id="YesPoint" class="Yes">Yes</div>
              <div id="NoPoint" class="No">No</div>
          </div>
        </div>
      </div>
    `;
};

function sourceSuggestion(open_state=true){
  const parentSuggestion = document.getElementById('SuggestionWindow');
  if (open_state){
    parentSuggestion.innerHTML = suggestionStructure();
    setSuggestionListeners();
    return 0;
  }
  else{
    const childSuggestion = document.getElementById('SourceSuggestion');
    childSuggestion.classList.remove('message-request');
    childSuggestion.classList.add('removeSuggestion');
    setTimeout(() => {
      parentSuggestion.innerHTML = '';
    }, 1099);
  };
};

function setSuggestionListeners(){
  setTimeout(() => {
    const yesPoint = document.getElementById('YesPoint');
    const noPoint = document.getElementById('NoPoint');
    if (yesPoint && noPoint){
      yesPoint.addEventListener('click', ()=>openURL(project_repo));
      noPoint.addEventListener('click', ()=>sourceSuggestion(false));
    }
  }, 99);
};