function conVoiceChannel(message) {
    // Check if the user is in a voice channel
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) {
        message.reply('You need to be in a voice channel to use this command!');
        return null; // Return null if user is not in a voice channel
    }

    // Check if the bot is already connected to the channel
    const existingConnection = getVoiceConnection(message.guild.id);
    if (existingConnection && existingConnection.joinConfig.channelId === voiceChannel.id) {
        message.reply(`I'm already in the voice channel: ${voiceChannel.name}!`);
        return voiceChannel; // Return the existing voice channel
    }

    // Join the voice channel
    joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: message.guild.id,
        adapterCreator: message.guild.voiceAdapterCreator,
    });
    
    message.reply(`Joined ${voiceChannel.name}!`);
    return voiceChannel; // Return the voice channel to play music
}


module.exports = {
    conVoiceChannel
}