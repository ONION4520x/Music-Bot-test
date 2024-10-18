function leaveVoiceChannel(message){
    
    const voiceChannel = message.member.voice.channel;
    if (voiceChannel) {
        const connection = getVoiceConnection(message.guild.id);
        if (connection) {
            connection.destroy();
            message.reply(`Left ${voiceChannel.name}!`);
        }else{
            message.reply('Bot already leave');
        }
    } else {
        message.reply('You need to be in a voice channel to use this command!');
    }
}


module.exports = {
    leaveVoiceChannel
}