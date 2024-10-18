const { EmbedBuilder } = require('discord.js');

function skipCurrentSong(distube, message) {

    const queue = distube.getQueue(message.guild.id); //get current queue returned a Queue object
    
    if (!queue) {
        return message.reply('There is no song in the queue.');
    }

    const songInfo = queue.songs[0];

    // Check if there are songs left in the queue
    if (queue.songs.length === 1) {
        distube.stop(message.guild.id);
    } else {
        distube.skip(message.guild.id);
    }

    const SkipEmbed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setDescription(`Skipped song: **${songInfo.name}**`)
        .setURL('https://discord.js.org/')
        .setTimestamp()
        .setFooter({ 
            text: 'Performed by ' + message.author.username, 
            iconURL: message.author.displayAvatarURL({ dynamic: true}) 
        })
        .setThumbnail(songInfo.thumbnail) 
        .setAuthor({ 
            name:  'Skip' , 
            iconURL: 'https://cdn.discordapp.com/app-icons/1064576063847538828/2af4f34ca0cac4adf392f08f5bb48c4d.png?size=512'   
        })
        ;

    // Send the embed message
    message.channel.send({ embeds: [SkipEmbed] });
}


module.exports = {skipCurrentSong};