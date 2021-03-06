export class Display {
  constructor(adapter, scale){
    this.adapter = adapter;
    this.scale = scale;
    this.modeSelected = document.getElementById("scale-root-mode");
    this.rootNoteSelected = document.getElementById("scale-root-note");
  }

  get load() {
    window.addEventListener('DOMContentLoaded', (e) => {
      // this.banner;
      this.logo;
      this.scaleCard;
      this.scaleFeelings;
    });
  }

  get addEventListeners() {
    this.addRootNoteEventListener;
    this.addModeEventListener;
    this.addFeelingListener;
  }

  get banner() {
    const scalesBanner = document.getElementById("scales-banner");
    scalesBanner.innerHTML = `
      <img src="src/img/scales.png" alt="SCALES">
    `;
  }

  get logo(){
    const scalesLogo = document.getElementById("scales-logo");
    scalesLogo.innerHTML = `
      <img src="src/img/scales.png" alt="SCALES">
    `;
  }

  get scaleCard(){
    const scaleCard = document.getElementById("scale-card");
    this.scaleNotes(scaleCard);
  }

  noteCard(noteInterval){
    const noteCard = document.createElement("div");
    noteCard.classList.add("scale-card--note-card");

    const noteText = document.createElement("span");
    noteText.classList.add("scale-card--note-text");

    const intervalText = document.createElement("span");
    intervalText.classList.add("scale-card--interval-text");

    noteText.innerText = noteInterval.note;
    intervalText.innerText = noteInterval.interval;
    noteCard.appendChild(noteText);
    noteCard.appendChild(intervalText);

    return noteCard;
  }

  scaleNotes(scaleCard){
    this.removeElements(".scale-card--notes");
    const scaleCardNotes = document.createElement('div');
    scaleCardNotes.classList.add("scale-card--notes");

    this.scale.notesIntervals.map( noteInterval => {
      scaleCardNotes.appendChild(this.noteCard(noteInterval));
    });

    scaleCard.appendChild(scaleCardNotes);
  }

  removeElements(classOrId){
    document.querySelectorAll(classOrId).forEach(e => e.parentNode.removeChild(e));
  }

  get updateView(){
    this.scaleCard;
    this.scaleFeelings;
  }

  get addRootNoteEventListener(){
    this.rootNoteSelected.addEventListener('change', (e) => {
      // instead of e.target.value, could also use this.rootNoteSelected.value
      this.scale.root = e.target.value;
      this.scale.mode = this.modeSelected.value;
      this.updateView;
    });
  }

  get addModeEventListener(){
    this.modeSelected.addEventListener('change', (e) => {
      // instead of e.target.value, could also use this.modeSelected.value
      this.scale.root = this.rootNoteSelected.value;
      this.scale.mode = e.target.value;
      this.updateView;
    });
  }

  buildScaleFeelings(feelings){
    this.removeElements("#feelings-show-card div")
    this.removeElements("#feeling-input-form--errors li");
    const feelingsShowCard = document.getElementById("feelings-show-card");
    feelings.sort( (a,b) => {
      return (a.adjective < b.adjective) ? -1 : 1;
    });

    for(const feeling of feelings){
      const feelingDiv = document.createElement('div');
      feelingDiv.innerHTML = `
        <span>${feeling.adjective}</span>
        <span>${feeling.count}</span>
      `;
      feelingsShowCard.appendChild(feelingDiv);
    }
  }

  get scaleFeelings(){
    const endpoint = `/scales/${this.scale.dbIndex}`;
    this.adapter.get(endpoint)
      .then(json => {
        this.buildScaleFeelings(json.data.top_feelings);
      });
  }

  get addFeelingListener(){
    const feelingInput = document.querySelector("#feeling-input-form");
    feelingInput.addEventListener('submit', (event) => {
      event.preventDefault();
      const feelingAdjective = feelingInput.querySelector("#adjective").value;
      this.createScaleFeeling(feelingAdjective);
    }, false);
  }

  updateScaleFeelings(json){
    const errors = json.errors;
    if (errors === false){
      this.scaleFeelings;
    }
    else{
      this.removeElements("#feeling-input-form--errors li");
      const etag = document.getElementById("feeling-input-form--errors");
      for(const error of errors){
        const errorLi = document.createElement("li");
        errorLi.innerText = error;
        etag.appendChild(errorLi);
      }
    }
  }

  createScaleFeeling(feelingAdjective){
    const endpoint = `/scales/${this.scale.dbIndex}/feelings`;
    const scaleId = this.scale.dbIndex;
    const data = {"scale_id": scaleId, "feeling_adjective": feelingAdjective.toLowerCase()};

    this.adapter.post(endpoint, data)
      .then(json => {
        this.updateScaleFeelings(json);
      });
  }
}
