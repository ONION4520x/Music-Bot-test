

function pausemusic(distube,message){

    distube.pause(message.guild.id);
    message.reply('song pause.');
}



module.exports = {pausemusic};