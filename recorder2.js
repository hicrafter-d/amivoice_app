////////////////////////////////////////////////////////
//////////　事前設定　///////////////////////////////////
////////////////////////////////////////////////////////
var tm1 = 0;
var tm2 = 0;
var tm3 = 0;
var tm4 = 0;
var miconoff01 =0;
var mix3miconoff01 =0;

///////////////////////////////////////////////////////////////////////
//////➀マイクからの録音　///////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////

// set up basic variables for app
//
// disable stop button while not recording
stop.disabled = true;

function Mstart() {
  if (navigator.mediaDevices.getUserMedia) {
    console.log('getUserMedia supported.');
    const constraints = { audio: true };
  
    let onSuccess = function(stream) {
      ///////////////////////////////////////////////
      var micaudioTracks = stream.getAudioTracks()[0];
      mixStream.addTrack(micaudioTracks);  
      ///////////////////////////////////////////////
    }
    let onError = function(err) {
      console.log('The following error occured: ' + err);
    }
    navigator.mediaDevices.getUserMedia(constraints).then(onSuccess, onError);
  } else {
    console.log('getUserMedia not supported on your browser!');
  }
  Gset();
  jyunbiButton();
}






///////////////////////////////////////////////////////////////////////////////////////////
//////////　➁画面キャプチャーのシステム音許可　＋　画面キャプチャー画面の選択///////////////////
//////////////////////////////////////////////////////////////////////////////////////////
function Gset() {
  //
  let chunks = [];
  //
  navigator.mediaDevices.getDisplayMedia(
    {audio: true,  video:true }
  ).then(gamenaudioStream => {
    var gamenaudioTracks = gamenaudioStream.getAudioTracks();
    mixStream.addTrack(gamenaudioTracks[0]);
    }
  ).catch(error => {
		console.error('mediaDevice.getDisplayMedia() error:', error)
	  }
  );

  
  navigator.mediaDevices.getDisplayMedia(
	  {audio: false,  video:true }
  ).then(gamenStream => {
	  var GgamenvideoTracks = gamenStream.getVideoTracks();
    mixStream.addTrack(GgamenvideoTracks[0]);
    //
    gousei();

    ////////////////////////////////////////////////////////////////////////////
    ///////★★　sound Clip 作成　///////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////
    const mediaRecorder = new MediaRecorder(mixX);
    Mrecord.onclick = function() {
      mediaRecorder.start();
      //console.log("Mrecorder:",mediaRecorder.state);
      console.log("Mrecorder started");
      Mrecord.style.background = "red";
      stop.disabled = false;
      Mrecord.disabled = true;
    }

    stop.onclick = function() {
      mediaRecorder.stop();
      //console.log("Mrecorder:",mediaRecorder.state);
      console.log("Mrecorder stopped");
      Mrecord.style.background = "";
      Mrecord.style.color = "";
      // mainbox.classList.remove("main1");
      // mainbox.classList.add("main2");
      stop.disabled = true;
      Mrecord.disabled = false;
    }

    mediaRecorder.onstop = function(e) {
      // console.log("Mrecorder data available after MediaRecorder.stop() called.");

      var today = new Date();

      const clipContainer = document.createElement('article');
      const clipLabel = document.createElement('p');
      clipLabel.textContent = "["+('0' +today.getMinutes()).slice(-2) + ":" + ('0' +today.getSeconds()).slice(-2)+"]";
      const audio = document.createElement('audio');
      const deleteButton = document.createElement('button');

      clipContainer.classList.add('clip');
      audio.setAttribute('controls', '');
      audio.setAttribute('preload', 'auto');
      
      
      
      deleteButton.textContent = '削除';
      deleteButton.className = 'delete';

      clipContainer.appendChild(clipLabel);
      clipContainer.appendChild(deleteButton);
      clipContainer.appendChild(audio);
      soundClips.appendChild(clipContainer);

      audio.controls = true;
      const blob = new Blob(chunks, { 'type' : 'audio/ogg; codecs=opus' });
      chunks = [];
      const audioURL = window.URL.createObjectURL(blob);
      audio.src = audioURL;
      // console.log("Mrecorder stopped");

      audio.volume = 0;
      audio.play();
      setTimeout(function () {
        audio.pause();
        audio.volume = 0.5;
      }, 500);

      deleteButton.onclick = function(e) {
        let evtTgt = e.target;
        evtTgt.parentNode.parentNode.removeChild(evtTgt.parentNode);
      }
    }

    mediaRecorder.ondataavailable = function(e) {
      chunks.push(e.data);
    }
    ////////////////////////////////////////////////////////////////////////////
    Video2.srcObject = mixStream;
  }
  ).catch(error => {
		console.error('mediaDevice.getDisplayMedia() error:', error)
	  }
  );  
}




//////////////////////////////////////////////////////////////////////////////////////////
///★★　Recording ////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////
let recorder2 =  null;   // ==== (2) 録画の準備 ====
let blobUrl = null;      // ==== (2) 録画の準備 ====
let chunks2 = [];        // ==== (2) 録画の準備 ====

// ==== (2) 録画 ====
function startRecording() {
  recorder2 = new MediaRecorder(mixX, { mimeType: 'video/webm;codecs=h264,opus' });
  chunks2 = []; // 格納場所をクリア    
  recorder2.ondataavailable = function(evt) {
    //console.log("data available: evt.data.type=" + evt.data.type + " size=" + evt.data.size);
    chunks2.push(evt.data);
  };
  recorder2.onstop = function(evt) {
    console.log('mixX video recorder2.onstop(),so video download OK!');
    recorder2 = null;
    playRecorded();
  };
  //
  //console.log('recorder2:',recorder2);
  //
  recorder2.start(1000); // インターバルは1000ms
  console.log('mixX video start recording');
}

// -- (2-2)録画停止 -- 
function stopRecording() {
  if (recorder2) {
    recorder2.stop();
    console.log("mixX video stop recording");
  } 
}

// -- (2-3)再生 --
function playRecorded() {
  if (! blobUrl) {
	  window.URL.revokeObjectURL(blobUrl);
	  blobUrl = null;
  }
  // Blob
  const videoBlob = new Blob(chunks2, { type: "video/webm" });     
  // 再生できるようにURLを生成
  blobUrl = window.URL.createObjectURL(videoBlob);
  // ==== (3) ダウンロード ====
  var today = new Date();
  anchor.download =  today.getFullYear() + ('0' + (today.getMonth()+1)).slice(-2) +  ('0'+today.getDate()).slice(-2) +'_'+ ('0' +today.getHours()).slice(-2) + ('0' +today.getMinutes()).slice(-2) + 'recorded' + '.webm';  // ファイル名
  anchor.href = blobUrl;              // createObjecURL()で生成したURL
 
 
  // --------(4) 録画した内容を再生　--------
 if (blobUrl) {
  playbackVideo.src = blobUrl;  
  // 再生終了時の処理
  playbackVideo.onended = function() {
  playbackVideo.pause();
  //playbackVideo.src = "";
  };
  // 再生開始
  playbackVideo.volume = 0;
  playbackVideo.play();
　setTimeout(function () {
    playbackVideo.pause();
    playbackVideo.volume = 0.5;
  }, 100);
  
 }
}




/////////////////////////////////////////////////
//////////　音声の合成　///////////////
////////////////////////////////////////////////
function gousei() {
    const audioCtx = new AudioContext();
    const dest = audioCtx.createMediaStreamDestination();
    const merger = audioCtx.createChannelMerger(2);

    var mix2 = new MediaStream();
   
    var miconoffaudiotrack = mixStream.getAudioTracks()[0];
    if(miconoff01 == 1){
      miconoffaudiotrack.enabled = true;     
      mix2.addTrack(miconoffaudiotrack);  
    } else {
      miconoffaudiotrack.enabled = false;
      mix2.addTrack(miconoffaudiotrack);
    }
    
    // mix2.addTrack(mixStream.getAudioTracks()[0]);
    //    console.log('mix2', mix2);
    //    console.log('mix2-Track', mix2.getTracks());
    var source2 = audioCtx.createMediaStreamSource(mix2);
    source2.connect(merger, 0, 0);
    source2.connect(merger, 0, 1);
     
    var mix3 = new MediaStream();
    //  mix3.addTrack(mixStream.getAudioTracks()[1]);

    var mix3miconoffaudiotrack = mixStream.getAudioTracks()[1];
    if(mix3miconoff01 == 0){
      mix3miconoffaudiotrack.enabled = true;     
      mix3.addTrack(mix3miconoffaudiotrack);  
    } else {
      mix3miconoffaudiotrack.enabled = false;
      mix3.addTrack(mix3miconoffaudiotrack);
    }

    //    console.log('mix3', mix3);
    //    console.log('mix3-Track', mix3.getTracks());
    var source3 = audioCtx.createMediaStreamSource(mix3);
    source3.connect(merger, 0, 0);
    source3.connect(merger, 0, 1);

    merger.connect(dest);
    
    mixX = dest.stream;
    //
    // console.log('mixStream-Track:', mixStream.getTracks());
    //
    mixX.addTrack(mixStream.getVideoTracks()[0]);
    //  console.log('mixX', mixX);
    //  console.log('mixX-Track:', mixX.getTracks()); 
    ///////////////////////////////////////////
    //Video2.srcObject = mixX;


}
//////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////




///////////////////////////////////////////
///////////////////////////////////////////
///////////////////////////////////////////
function jyunbiButton(){
  if(tm4 ++ % 2 ==0){
    devset.style.background = 'pink';
    devset.textContent = "準備OK!";
  }else{
    devset.style.background = '#f4f4f4';
    devset.textContent = "事前準備";
  }
}


function Estart() {
  if(tm2 ++ % 2 ==0){
    issueButton.click();
    resumePauseButton.click();
    //
    //startRecording();
    //RecB.style.background = 'pink';
    //RecB.textContent = "録画停止";
    //tm1 = tm1 + 1 ;
    //
    //console.log('mixX-Track:', mixX.getTracks());
    MRecord01.click();
    Recording();
    estart1.style.background = 'pink';
    estart1.style.border = '1px solid gray';
    estart1.textContent = "書き起こし停止";
  }else{
    estart1.style.background = '#e6ec88';
    estart1.textContent = "書き起こし開始";
    resumePauseButton.click();
    Mstop01.click();
    Recording();
    //
    //stopRecording();
    //RecB.style.background = '#f4f4f4';
    //RecB.textContent = "録画開始";
    //tm1 = tm1 + 1 ;
    //console.log('mixX-Track:', mixX.getTracks());
  }  
}


function Miconoff() {
  if(tm3 ++ % 2 ==0){
    miconoff01 = 1;
    DevMic.style.background = 'pink';
    DevMic.style.border = '1px solid gray';
    DevMic.textContent = "マイクON";
    gousei();
  }else{
    DevMic.style.background = '#f4f4f4';
    DevMic.textContent = "マイクOFF";
    miconoff01 = 0;
    gousei();
  }  
}


function Recording(){
  if(tm1 ++ % 2 ==0){
    startRecording();
    RecB.style.background = 'pink';
    RecB.textContent = "録画停止";
  }else{
    stopRecording();
    RecB.style.background = '#f4f4f4';
    RecB.textContent = "録画開始";
  }
}


function insert(){
  var today = new Date();
  karam.insertAdjacentHTML('beforeend', "["+('0' +today.getMinutes()).slice(-2) + ":" + ('0' +today.getSeconds()).slice(-2)+"]" + "<br>");
  karam.scrollTo(0, karam.scrollHeight);
  Mstop01.click();
  MRecord01.click();
}

function sepa(){
  mix3miconoff01 = 1;
  setTimeout(function () {
    gousei();
  }, 100);
  setTimeout(function () {
    mix3miconoff01 = 0;
    gousei();
  }, 500);
}


function DownT() {
  const tblob = new Blob([karam.innerText], {type: 'text/plain'});
  const turl = URL.createObjectURL(tblob);
  const a = document.createElement("a");
  document.body.appendChild(a);
  var today = new Date();
  a.download = today.getFullYear() + ('0' + (today.getMonth()+1)).slice(-2) +  ('0'+today.getDate()).slice(-2) +'_'+ ('0' +today.getHours()).slice(-2) + ('0' +today.getMinutes()).slice(-2) + 'text' + '.txt';  // ファイル名
  a.href = turl;
  a.click();
  a.remove();
  URL.revokeObjectURL(turl);
}

