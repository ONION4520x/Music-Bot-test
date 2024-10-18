const { generateDependencyReport } = require('@discordjs/voice');
const ytdl = require('ytdl-core');
const command_join = require('./command/join');
const command_leave = require('./command/leave');

console.log(generateDependencyReport());


async function getPing(interaction,client){

    await interaction.deferReply();

    // Use setTimeout to allow the interaction to be processed
    setTimeout(async () => {
        const reply = await interaction.fetchReply(); 
        const ping = reply.createdTimestamp - interaction.createdTimestamp;

        if (!isNaN(ping)) {
            await interaction.editReply(`Ping: ${ping} ms || WebSocket Ping: ${client.ws.ping} ms`);
        } else {
            await interaction.editReply("Could not get ping.");
        }
    }, 50); // Delay to ensure interaction is fully processed
}

async function checkAvail(interaction){

    const url = interaction.options.getString('url');

    // Defer the reply to acknowledge the interaction
    await interaction.deferReply();

    try {
        const info = await ytdl.getInfo(url); // Get video info
        // Reply with the video title and URL
        await interaction.followUp(`Search Result \nSongName: \`${info.videoDetails.title}\`\nURL: \`${info.videoDetails.video_url}\``);
        
    } catch (err) {
        console.error('Error fetching video info:', err);
        await interaction.followUp("URL not supported");
    }
}

//Function Command
function getCommand(interaction,client){

    console.log(`[Command] [${client.user.username}]: /${interaction.commandName}   `);

    if(interaction.commandName === 'ping'){
        getPing(interaction,client);
    }
    if(interaction.commandName === 'join'){
        command_join.conVoiceChannel(interaction)
    }
    if(interaction.commandName === 'leave'){
        command_leave.leaveVoiceChannel(interaction);
    }
    if(interaction.commandName === 'validate'){
        checkAvail(interaction);
    }
    
}


module.exports = {
    checkAvail,
    getCommand
};
