const { Client, GatewayIntentBits,REST, Routes } = require('discord.js');
const { DisTube } = require('distube');
const { YouTubePlugin } = require('@distube/youtube');
const { EmbedBuilder } = require('discord.js');

const fs = require('fs');
const path = require('path');
const mbot = require('./bot_Command');
const etc = require('./util/etc');
const pathToFfmpeg = require('ffmpeg-static');
const prefix = ".";

//load enviroment key
require('dotenv').config();

function loadAllcommand(){
  try{
  // Read all files from the 'command' folder
  const commandFiles = fs.readdirSync(path.join(__dirname, 'command')).filter(file => file.endsWith('.js'));

  // Loop through the files and require each one
  const comm = {};
  for (const file of commandFiles) {
      const commandName = file.split('.')[0]; // Get the file name without the extension
      comm[commandName] = require(`./command/${file}`);
  }
  // Now you can access all required files in 'commands'
  
  module.exports = comm;
  return comm;

  }catch(err){
    console.error(err);
  }
}

//Initialization 
const comm = loadAllcommand(); //Load all Command

// Create a new client instance with necessary intents
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent, 
  ],
});

  const distube = new DisTube(client,
    {
        plugins: [
        new YouTubePlugin(), 
        ],
        emitAddListWhenCreatingQueue: true,
        emitAddSongWhenCreatingQueue: true,
        ffmpeg: {
          path: pathToFfmpeg,
          args: {
            global: {
              reconnect: '1',           // Enable reconnection attempts
              reconnect_streamed: '1',  // Enable reconnection for streamed content
              reconnect_delay_max: '5'  // Max delay between reconnection attempts
            },
            input: {},
            output: {}
          }
         },
    }
);

//bot login
client.login(process.env.BOTTOKEN)
.then(()=>{
    console.log("Auth Success");
    console.log("FFmpeg path: " + pathToFfmpeg);
})
.catch((e)=>{
    console.error("Error: " + e);
});

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
    console.log('Bot is online!');
    console.log(`  `);
    console.log(`Start from here are console log`);
    console.log(`------------------------------------------------------------------------`);
});

// slash (/) command list
const commands = [
    {
        name: 'ping',
        description: 'Return ping status'
    },
    {
        name: 'join',
        description: 'Join the user current voice channe;'
    },
    {
        name: 'leave',
        description: 'Leave voice channel'
    },
    {
      name: 'validate',
      description: 'Validate support url',
      options:[{
        name: 'url',
        description: 'URL',
        type: 3,
        required: true,
      }],
    }
];

// DisTube error event listener
distube.on('finishSong', (queue, song) => {

  let songInfo = queue.songs[1];
    
  if(songInfo === undefined){
      queue.textChannel.send("No More Songs in the Queue");
  }else{
    const embed = new EmbedBuilder()
    .setColor(0xFF0000)
    .setThumbnail(songInfo.thumbnail) 
    .setAuthor({ 
      name:  'Next Song' , 
      iconURL: 'https://cdn.discordapp.com/app-icons/1064576063847538828/2af4f34ca0cac4adf392f08f5bb48c4d.png?size=512'   
    })
    .setDescription(`Now Playing : \`${songInfo.name}\`\n Duration : \`${songInfo.formattedDuration}\` `);

    queue.textChannel.send({ embeds: [embed] });
  }
  });

   
////////////////////////////////////////////////////////////////////////////////////////////////////////

//Setting Up the REST Client
const rest = new REST({ version: '10' }).setToken(process.env.BOTTOKEN);

(async ()=>{
    try {
        rest.put(Routes.applicationCommands(process.env.BOTID), { body: commands });
       console.log('Successfully reloaded application (/) commands.');
     } catch (error) {
       console.error(error);
     }
})();


//slash command
// Handle interaction commands
client.on('interactionCreate', interaction => {
    if (!interaction.isChatInputCommand()) 
        return;
    else{
        mbot.getCommand(interaction,client);
    }
  });

//prefix event
// Event listener for messages
client.on('messageCreate', message => {

    // Ignore messages from the bot itself
    if (message.author.bot) return;

    var command = message.content.slice(prefix.length).trim(); 

    if (message.content.startsWith(prefix)) {

        console.log(`[MessageCommand] [${client.user.displayName}]: ${message.content} `);

        var arr = {};

        if(etc.containsWhitespace(command)){
            arr = command.split(' ');
            command = arr[0]; //return prefix text witout the prefix tag
        }

        if (command === 'c' || command === 'connect' || command === 'join'){
          mbot.conVoiceChannel(message);
          const voiceChannel = message.member.voice.channel;
          distube.voices.join(voiceChannel);
        } // Join
        if (command === 'leave' ){mbot.leaveVoiceChannel(message);} // leave
        if(command === 'pause' || command === 'stop'){comm.pause.pausemusic(distube,message);}  //pause
        if(command === 'resume' || command === 'start'){comm.resume.resumemusic(distube,message);}  //resume
        if(command === 'skip' ){comm.skip.skipCurrentSong(distube,message);}  //skip
        if(command === 'q' || command === 'queue'){comm.queue.displayQueue(distube,message)}
        if (command === 'p' || command === 'play'){    //play

          //whole string length
          var messageLenght = message.content.length;

          //get the command index
          var prefixlength = message.content.lastIndexOf(prefix + command ); 

          //get the song name or url
          var songInfo = (message.content.substring(prefixlength+(command.length) + 2 ,messageLenght)).trimStart();  // +2 because the index start from 0 and a white space between the last index of prefix and the first index of the song name

          if(songInfo.includes('http://') || songInfo.includes('https://'))
            {
              etc.getSongName(songInfo)
              .then(songName => {comm.play.playmusic(distube, message,songName)})
              .catch(err => {console.error(err)});
            }
            else{ comm.play.playmusic(distube, message,songInfo); }
        }
    }
}

);

