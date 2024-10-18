const { EmbedBuilder } = require('discord.js');
const util = require('../util/etc');


async function playmusic(distube,message,songName){
    
    const position = 0;

    try{

    const song = await util.getSongClasswithName(distube,songName);

    // Get the voice channel from the message member
    const voiceChannel = message.member.voice.channel;

    // Check if the member is in a voice channel
    if (!voiceChannel) {
        return message.reply("You need to be in a voice channel to play music!");
    }

    // Check if there is an existing queue
    var queue = distube.getQueue(message.guild.id);

    // If there is no existing queue, play the song
    if (!queue) {
        await distube.play(voiceChannel, song.url, {
            textChannel: message.channel,
            member: message.member,
        });

    queue = distube.getQueue(message.guild.id);  // check again

    const songInfo = queue.songs[0];

    const PlayEmbed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setAuthor({ 
            name:  'Play' , 
            iconURL: 'https://cdn.discordapp.com/app-icons/1064576063847538828/2af4f34ca0cac4adf392f08f5bb48c4d.png?size=512'   
        })
        .setThumbnail(songInfo.thumbnail) 
        .setDescription(`Playing Song: **${songInfo.name}**`)
        .setURL('https://discord.js.org/')
        .setTimestamp()
        .setFooter({ 
            text: 'Performed by ' + message.author.username, 
            iconURL: message.author.displayAvatarURL({ dynamic: true}) 
        })
        ;

    // Send the embed message
    message.channel.send({ embeds: [PlayEmbed] });

    } else {    // If a queue exists, add the song to the queue 
    queue.addToQueue(song, position);
    var queue = distube.getQueue(message.guild.id);
    const queueLen = queue.songs.length;
    const songInfo = queue.songs[queueLen-1].name;
    message.channel.send(`Added \`${songInfo}\` to the queue!`);
    }

    }catch(err){
        console.error("[command][play.js] Error: Error happend");
        message.reply("Invalid song or Url");
    }
}



module.exports = {playmusic};