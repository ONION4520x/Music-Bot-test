function resumemusic(distube,message){

    distube.resume(message.guild.id);
    message.reply('song continued.');
}

module.exports = {resumemusic};