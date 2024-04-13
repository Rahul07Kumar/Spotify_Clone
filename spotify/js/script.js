let currentSong=new Audio();
let songs;
let currFolder;


async function getSongs(folder) {
  currFolder=folder;
  // let a = await fetch(`http://127.0.0.1:5500/spotify/${folder}/`);
  let a = await fetch(`http://127.0.0.1:5500/${folder}/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  songs = [];
  for (let i = 0; i < as.length; i++) {
    const element = as[i];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${folder}/`)[1]);
    }
  }
  
    // Show all the songs in the playlist
    let songUL = document
    .querySelector(".songList")
    .getElementsByTagName("ul")[0];
  songUL.innerHTML="";

  for (const song of songs) {
    songUL.innerHTML = songUL.innerHTML +
      `<li>
        <img class="invert" width="34" src="img/music.svg" alt="">
        <div class="info">
            <div>${song.replaceAll("%20", " ")}</div>
            <div>Rahul Kumar</div>
        </div>
        <div class="playnow">
            <span>Play Now</span>
            <img class="invert" src="img/play.svg" alt="">
        </div>
    </li>`;
  }


    //Attach eventlistner to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e=>{
      e.addEventListener("click",element=>{
        // console.log(e.querySelector(".info").firstElementChild.innerHTML)
        playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
      })
    })

    return songs
}

function secondsToMinutesAndSec(seconds) {
  if(isNaN(seconds)|| seconds<0){
    return "00:00"
  }
  var minutes = Math.floor(seconds / 60);
  var remainingSeconds = Math.floor(seconds % 60);

  // Ensure the minutes and seconds are formatted with leading zeros
  var formattedTime = `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  
  return formattedTime;
}


const playMusic=(track,pause=false)=>{
  // let audio = new Audio("/spotify/${folder}/"+track)
  currentSong.src= `${currFolder}/`+track
  // currentSong.play();
  if(!pause){
    currentSong.play();
    play.src="img/pause.svg";
  }
  
  document.querySelector(".songinfo").innerHTML=decodeURI(track)
  document.querySelector(".songtime").innerHTML="00:00/00:00"
}


async function displayAlbums(){
  // let a = await fetch(`http://127.0.0.1:5500/spotify/songs/`);
  let a = await fetch(`http://127.0.0.1:5500/songs/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let anchors=div.getElementsByTagName("a")
  let cardContainer=document.querySelector(".cardContainer")
  let array= Array.from(anchors);
  for (let index = 0; index < array.length; index++) {
    const e = array[index];
    if(e.href.includes("songs/")){
      let folder= e.href.split("/").slice(-1)[0];
      // Get the metadata of the folder
      // let a = await fetch(`http://127.0.0.1:5500/spotify/songs/${folder}/info.json`);
      let a = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`);
      let response = await a.json();
      console.log(response)
      cardContainer.innerHTML= cardContainer.innerHTML+ 
      `<div data-folder="${folder}" class="card ">
      <div class="play">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"
              color="#000000" fill="black">
              <circle cx="12" cy="12" r="12" fill="#1fdf64" />
              <path
                  d="m7.05 3.606 13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z">
              </path>
          </svg>
      </div>
      
      <img src="/songs/${folder}/cover.jpeg" alt="">
      <h2>${response.title}</h2>
      <p>${response.discription}</p>
  </div>`
    }
  }

    // Load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e=>{
      e.addEventListener("click",async item=>{
        songs=await getSongs(`songs/${item.currentTarget.dataset.folder}`)
        // item.dataset.folder
        playMusic(songs[0]);
      })
    })

  playMusic(songs[0])
}

async function main() {

  // Get all songs
 await getSongs("songs/ncs");
  // currentSong.src=songs[0];
  playMusic(songs[0],true);

  // Display all the albums on the page
  displayAlbums()


  // Attach an event listner to play,next and previous
  play.addEventListener("click",()=>{
    if(currentSong.paused){
      currentSong.play();
      play.src="img/pause.svg"
    }
    else{
      currentSong.pause();
      play.src="img/play.svg"
    }
  })

  // Listen for timeupdate event
  currentSong.addEventListener("timeupdate",()=>{
    // console.log(secondsToMinutesAndSec(currentSong.currentTime),currentSong.duration);
    document.querySelector(".songtime").innerHTML=`${secondsToMinutesAndSec(currentSong.currentTime)} / ${secondsToMinutesAndSec(currentSong.duration)}`
    document.querySelector(".circle").style.left=((currentSong.currentTime/currentSong.duration)*100-0.5)+"%";
  })

  // Add an event listener to seekbar
  document.querySelector(".seekbar").addEventListener("click",e=>{
    let percent=(e.offsetX/e.target.getBoundingClientRect().width)*100;
    document.querySelector(".circle").style.left= (percent - 0.5) +"%";
    currentSong.currentTime=percent*currentSong.duration/100;
  })

  // Add eventlistener to humburger
  document.querySelector(".hamburger").addEventListener("click",()=>{
    document.querySelector(".left").style.left= "0"; 
  })

  // Add eventlistener to close
  document.querySelector(".close").addEventListener("click",()=>{
    document.querySelector(".left").style.left= "-120%"; 
  })

  // Add an event listener to previous and next
  previous.addEventListener("click",()=>{
    let index= songs.indexOf(currentSong.src.split("/").slice(-1)[0])
    if((index-1)>=0){
      // console.log(songs[index-1]);
      playMusic(songs[index-1]);
    }
    else{
      playMusic(songs[songs.length]);
    }
  })
  next.addEventListener("click",()=>{
    let index= songs.indexOf(currentSong.src.split("/").slice(-1)[0])
    if((index+1)<(songs.length)){
      playMusic(songs[index+1]);
    }
    else{
      playMusic(songs[0]);
    }
  })

  // Add an eventlistner to volume bar
  document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change",(e)=>{
    console.log("setting volume to " + e.target.value+" / 100")
    currentSong.volume=parseInt(e.target.value)/100;
    if(currentSong.volume>0){
      let f=document.querySelector(".volume>img");
      f.src=f.src.replace("img/mute.svg","img/volume.svg");
    }
  })

// Add an eventlistner to mute
  document.querySelector(".volume>img").addEventListener("click",e=>{
    if(e.target.src.includes("img/volume.svg")){
      e.target.src=e.target.src.replace("img/volume.svg","img/mute.svg");
      currentSong.volume=0;
      document.querySelector(".range").getElementsByTagName("input")[0].value=0;
    }
    else{
      e.target.src=e.target.src.replace("img/mute.svg","img/volume.svg");
      currentSong.volume=0.1;
      document.querySelector(".range").getElementsByTagName("input")[0].value=10;
    }
  })

}

main();
