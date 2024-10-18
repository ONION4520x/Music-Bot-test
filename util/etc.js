const ytdl = require('ytdl-core');
const { YouTubePlugin } = require('@distube/youtube');


function containsWhitespace(str) {
    return /\s/.test(str);
}

async function getSongClasswithName(distube,SongName){
    try{
        const plugin = distube.plugins.find(p => p instanceof YouTubePlugin);
        const song = await plugin.searchSong(SongName);
        return song;
    }catch(err){
        console.error("[util][etc.js][getSongClasswithName] Error: search string is mandatory");
        return;
    }
    
}

async function getSongName(url){
    try {
        const info = await ytdl.getInfo(url);  
        const songName = info.videoDetails.title;  
        return songName;  
    } catch (err) {
        console.error('[Util][etc.js][getSongName] Error: Not a YouTube domain');
        return;  
    }
}


module.exports = {
    containsWhitespace, 
    getSongClasswithName,   
    getSongName
}