const { EmbedBuilder } = require('discord.js');


async function displayQueue(distube, message) {
    const queue = distube.getQueue(message.guild.id);

    if (!queue || queue.songs.length === 0) {
        return message.reply("There are no songs in the queue!");
    }

    const songsPerPage = 10; // Number of songs to display per page
    let currentPage = 0; // Track the current page

    const totalPages = Math.ceil(queue.songs.length / songsPerPage);
    
    // Function to create the embed
    const createEmbed = () => {
        const startIndex = currentPage * songsPerPage;
        const endIndex = startIndex + songsPerPage;
        const songsToDisplay = queue.songs.slice(startIndex, endIndex);
        
        const embed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setAuthor({ 
                name:  'Queue' , 
                iconURL: 'https://cdn.discordapp.com/app-icons/1064576063847538828/2af4f34ca0cac4adf392f08f5bb48c4d.png?size=512'   
            })
            .setDescription(songsToDisplay.map((song, index) => `${startIndex + index + 1}. \`${song.name}\` | [Link](${song.url})`).join('\n'))
            .setFooter({ text: `Page ${currentPage + 1} of ${totalPages}` });

        return embed;
    };

    // Send the embed message
    const queueMessage = await message.channel.send({ embeds: [createEmbed()] });
    
    // Add reactions for pagination
    await queueMessage.react('◀️'); // Previous page
    await queueMessage.react('▶️'); // Next page

    // Set up a reaction collector
    const filter = (reaction, user) => {
        return ['◀️', '▶️'].includes(reaction.emoji.name) && !user.bot;
    };

    const collector = queueMessage.createReactionCollector({ filter, time: 60000 }); 

    collector.on('collect', (reaction, user) => {
        // Remove the user's reaction
        reaction.users.remove(user.id);

        if (reaction.emoji.name === '◀️') {
            if (currentPage > 0) currentPage--; // Go to the previous page
        } else if (reaction.emoji.name === '▶️') {
            if (currentPage < totalPages - 1) currentPage++; // Go to the next page
        }

        // Update the embed message
        queueMessage.edit({ embeds: [createEmbed()] });
    });

    collector.on('end', () => {
        queueMessage.reactions.removeAll().catch(error => console.error('Failed to clear reactions:', error));
    });
}

module.exports = { displayQueue };