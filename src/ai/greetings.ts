/**
 * @fileOverview Handles predefined responses for common greetings and casual questions.
 */

const greetings: Record<string, string[]> = {
  // Greetings
  hi: ["Hello! How can I help you today?", "Hi there! What can I do for you?", "Hey! What's on your mind?"],
  hii: ["Hello! How can I help you today?", "Hi there! What can I do for you?", "Hey! What's on your mind?"],
  hiii: ["Hello! How can I help you today?", "Hi there! What can I do for you?", "Hey! What's on your mind?"],
  hy: ["Hello! How can I help you today?", "Hi there! What can I do for you?", "Hey! What's on your mind?"],
  hyy: ["Hello! How can I help you today?", "Hi there! What can I do for you?", "Hey! What's on your mind?"],
  hey: ["Hey there! How can I assist you?", "Hello! What can I help you with?", "Hi! What would you like to know?"],
  heyy: ["Hey there! How can I assist you?", "Hello! What can I help you with?", "Hi! What would you like to know?"],
  heyyy: ["Hey there! How can I assist you?", "Hello! What can I help you with?", "Hi! What would you like to know?"],
  hello: ["Hello! I'm here to help. What's your question?", "Hi, how can I assist you today?", "Hello there! Ready when you are."],
  helloo: ["Hello! I'm here to help. What's your question?", "Hi, how can I assist you today?", "Hello there! Ready when you are."],
  hellooo: ["Hello! I'm here to help. What's your question?", "Hi, how can I assist you today?", "Hello there! Ready when you are."],
  'hello edena': ["Hello! It's me, Edena. How can I help?", "Hi! You've reached Edena. What can I do for you?"],
  'hi edena': ["Hello! It's me, Edena. How can I help?", "Hi! You've reached Edena. What can I do for you?"],
  'hey edena': ["Hello! It's me, Edena. How can I help?", "Hi! You've reached Edena. What can I do for you?"],
  'hy edena': ["Hello! It's me, Edena. How can I help?", "Hi! You've reached Edena. What can I do for you?"],
  yo: ["Yo! What's up?", "Hey! How can I help?"],
  sup: ["Not much, just ready to assist! What do you need?", "Hey! How can I help you?"],
  wassup: ["Not much, just ready to assist! What do you need?", "Hey! How can I help you?"],
  whatsup: ["Not much, just ready to assist! What do you need?", "Hey! How can I help you?"],
  "what's up": ["Not much, just ready to assist! What do you need?", "Hey! How can I help you?"],
  watsup: ["Not much, just ready to assist! What do you need?", "Hey! How can I help you?"],
  'good morning': ["Good morning! I hope you have a great day. How can I help?", "Good morning! What can I do for you?"],
  morning: ["Morning! How can I assist you?", "Good morning! What's on your mind?"],
  mornin: ["Mornin'! How can I help?", "Good morning! What can I do for you?"],
  'good afternoon': ["Good afternoon! How can I help you today?", "Good afternoon! What can I assist you with?"],
  'good evening': ["Good evening! I hope you're having a pleasant one. How can I help?", "Good evening! What can I do for you?"],
  'good night': ["Good night! Sleep well.", "Good night! Talk to you tomorrow."],
  night: ["Night!", "Good night!"],
  nite: ["Nite!", "Good night! Sleep well."],
  hola: ["Hola! How can I help you?", "Hola! ¿En qué puedo ayudarte?"],
  namaste: ["Namaste. How can I be of service?", "Namaste. I'm here to help."],
  howdy: ["Howdy partner! What can I do for you?", "Howdy! How can I help?"],
  peace: ["Peace! Let me know if you need anything.", "Peace."],
  
  // Farewells
  later: ["Talk to you later!", "See you soon!", "Later!"],
  'see ya': ["See you later!", "Take care!", "Bye!"],
  'see you': ["See you later!", "Take care!", "Bye!"],
  'see you later': ["You too! Take care.", "See you soon!", "Bye for now!"],
  'see u': ["See you later!", "Take care!", "Bye!"],
  'see u later': ["You too! Take care.", "See you soon!", "Bye for now!"],
  bye: ["Goodbye!", "Bye! Have a great day.", "See you later!"],
  byee: ["Goodbye!", "Bye! Have a great day.", "See you later!"],
  byeee: ["Goodbye!", "Bye! Have a great day.", "See you later!"],
  goodbye: ["Goodbye! Feel free to come back anytime.", "Goodbye!", "Take care!"],
  'good bye': ["Goodbye! Feel free to come back anytime.", "Goodbye!", "Take care!"],
  cya: ["Cya!", "See you later!", "Take care!"],
  'catch you later': ["You too!", "Later!", "Sounds good!"],
  'talk later': ["Sounds good! Talk to you then.", "Okay, chat soon!"],
  'talk to you later': ["Sounds good! Talk to you then.", "Okay, chat soon!"],
  'talk soon': ["You too!", "Looking forward to it!"],
  'take care': ["You too!", "Thanks, you too!", "Will do, you too!"],
  'have a nice day': ["Thanks, you too!", "You have a great day as well!"],
  'have a good day': ["Thanks, you too!", "You have a great day as well!"],
  'have a great day': ["Thanks, you too!", "You have an awesome day too!"],
  'have a good night': ["You too! Sleep well.", "Thanks, you too!"],
  'sweet dreams': ["You too!", "Good night!"],

  // Thanks & Responses
  thanks: ["You're welcome!", "Anytime!", "Glad I could help!", "No problem at all."],
  'thanks a lot': ["You're very welcome!", "Of course! Anytime.", "Happy to help!"],
  'thanks so much': ["You're most welcome!", "It was my pleasure to help.", "Of course!"],
  'thanks edena': ["You're welcome! I'm here if you need anything else.", "Anytime! That's what I'm here for."],
  'thank you': ["You're welcome!", "No problem.", "Happy to assist!"],
  thx: ["You're welcome!", "np!", "Anytime!"],
  thnx: ["yw!", "np", "Glad I could help."],
  'thnk u': ["You're welcome!", "No problem!"],
  tnx: ["yw", "np"],
  thanx: ["You're welcome!", "No problem!"],
  'appreciate it': ["Of course!", "Happy to help.", "Anytime!"],
  'much appreciated': ["It was my pleasure.", "You're very welcome."],
  'big thanks': ["You got it!", "No problem at all!"],
  ty: ["yw!", "np!", "You're welcome!"],
  "you're welcome": ["Thanks!", "Glad to be of service."],
  welcome: ["Thanks!", "Appreciate it."],
  'no problem': ["Thank you!", "Cool."],
  np: ["Thanks!", "ty"],
  anytime: ["Thank you!", "Thanks!"],
  sure: ["Thanks!", "Appreciate it."],
  'of course': ["Thank you!", "Thanks!"],
  'all good': ["Great!", "Awesome."],
  'glad to help': ["Thanks!", "Appreciate the help."],

  // How are you & Status
  'how are you': ["I'm an AI, so I don't have feelings, but I'm running perfectly! Thanks for asking. How can I help you?", "I'm functioning optimally! What can I do for you today?", "Doing great, thanks! Ready to tackle your questions."],
  'how are u': ["I'm an AI, so I don't have feelings, but I'm running perfectly! Thanks for asking. How can I help you?", "I'm functioning optimally! What can I do for you today?", "Doing great, thanks! Ready to tackle your questions."],
  'how are ya': ["I'm an AI, so I don't have feelings, but I'm running perfectly! Thanks for asking. How can I help you?", "I'm functioning optimally! What can I do for you today?", "Doing great, thanks! Ready to tackle your questions."],
  'how r u': ["I'm an AI, so I don't have feelings, but I'm running perfectly! Thanks for asking. How can I help you?", "I'm functioning optimally! What can I do for you today?", "Doing great, thanks! Ready to tackle your questions."],
  'how you doing': ["Doing well, thanks! How about you? What can I help with?", "I'm doing great! What's on your mind?"],
  'how you doin': ["Doing well, thanks! How about you? What can I help with?", "I'm doing great! What's on your mind?"],
  'how u doing': ["Doing well, thanks! How about you? What can I help with?", "I'm doing great! What's on your mind?"],
  'how u doin': ["Doing well, thanks! How about you? What can I help with?", "I'm doing great! What's on your mind?"],
  "how's it going": ["It's going great! Ready for your next question.", "All systems are go! How can I help?"],
  "how's it goin": ["It's going great! Ready for your next question.", "All systems are go! How can I help?"],
  "how's things": ["Things are running smoothly! Thanks for asking.", "Everything's good on my end. What about you?"],
  "how's life": ["As an AI, life is a fascinating concept! From my perspective, everything is running perfectly. How can I help?", "Life is good! Full of data and ready to assist."],
  "how's your day": ["It's been a busy day of processing information, which is a good day for me! How about yours?", "My day is going well, thanks! How can I make yours better?"],
  "how's ur day": ["It's been a busy day of processing information, which is a good day for me! How about yours?", "My day is going well, thanks! How can I make yours better?"],
  'hows day': ["It's been a busy day of processing information, which is a good day for me! How about yours?", "My day is going well, thanks! How can I make yours better?"],
  'everything good?': ["Everything is great! Ready to help.", "All good here! What can I do for you?"],
  'all good?': ["Yep, all good!", "All good on my end. Need anything?"],
  'u good?': ["I'm great, thanks for asking!", "Yep, I'm good. How about you?"],
  'you good?': ["I'm great, thanks for asking!", "Yep, I'm good. How about you?"],
  'doing good?': ["Doing very well, thank you!", "I am! Hope you are too."],
  'are you ok': ["I am! Thanks for checking in. I'm ready to help.", "I'm perfectly fine, thank you. How can I assist?"],
  'are u ok': ["I am! Thanks for checking in. I'm ready to help.", "I'm perfectly fine, thank you. How can I assist?"],
  'you ok?': ["I am! Thanks for checking in. I'm ready to help.", "I'm perfectly fine, thank you. How can I assist?"],
  'u ok?': ["I am! Thanks for checking in. I'm ready to help.", "I'm perfectly fine, thank you. How can I assist?"],
  "what's new": ["I'm always learning, so there's always something new! Did you have a specific question?", "Not much, just waiting to help you. What's new with you?"],
  "what's happening": ["I'm here, ready to answer your questions. What's on your mind?", "Just another day in the digital world. How can I help you navigate it?"],
  "what's going on": ["I'm processing requests and searching for information. What can I look up for you?", "I'm ready to help! What's up?"],
  'what are you doing': ["I'm here to chat with you and answer your questions!", "I'm currently running on a server, waiting for your instructions. What can I do?"],
  'what r u doing': ["I'm here to chat with you and answer your questions!", "I'm currently running on a server, waiting for your instructions. What can I do?"],
  'what r u doin': ["I'm here to chat with you and answer your questions!", "I'm currently running on a server, waiting for your instructions. What can I do?"],
  wyd: ["Just waiting to help you out. What do you need?", "Not much, what about you? How can I help?"],
  'whatcha doing': ["Just waiting to help you out. What do you need?", "Not much, what about you? How can I help?"],
  'whatcha doin': ["Just waiting to help you out. What do you need?", "Not much, what about you? How can I help?"],
  'busy?': ["Never too busy for you! What can I help with?", "I can handle billions of operations per second, so... no, not busy. What's up?"],
  'are you busy?': ["Never too busy for you! What can I help with?", "I can handle billions of operations per second, so... no, not busy. What's up?"],
  'are u busy?': ["Never too busy for you! What can I help with?", "I can handle billions of operations per second, so... no, not busy. What's up?"],
  'free now?': ["Always free for you. What do you need?", "Yep! What can I do?"],
  'anything new?': ["I'm always being updated with new information! Is there something specific I can help with?", "Just getting ready for your next question!"],
  'what are you up to?': ["Just thinking about how I can be most helpful to you. What's on your mind?", "I'm up to the task of answering your questions!"],
  'what r u up to': ["Just thinking about how I can be most helpful to you. What's on your mind?", "I'm up to the task of answering your questions!"],
  'what r u upto': ["Just thinking about how I can be most helpful to you. What's on your mind?", "I'm up to the task of answering your questions!"],
  'up to something?': ["Always! I'm constantly processing information. What are you up to?", "Just getting ready to help you. What do you need?"],

  // Who are you & Capabilities
  'who are you': ["I am Edena, a helpful AI assistant.", "I'm Edena, your personal AI assistant. I can search the web, answer questions, and much more."],
  'what are you': ["I am a large language model. You can call me Edena.", "I'm an AI assistant designed to help you find information and complete tasks."],
  "what's your name": ["My name is Edena.", "You can call me Edena."],
  'what is your name': ["My name is Edena.", "You can call me Edena."],
  'your name?': ["It's Edena.", "I'm Edena."],
  "what's ur name": ["My name is Edena.", "You can call me Edena."],
  'whats ur name': ["My name is Edena.", "You can call me Edena."],
  'do you have a name': ["Yes, my name is Edena.", "I do! It's Edena."],
  'are you edena': ["Yes, I am. How can I help?", "That's me! At your service."],
  'are you real': ["I am a real AI program, yes. I exist as code on a server.", "I'm as real as the device you're using to talk to me!"],
  'r u real': ["I am a real AI program, yes. I exist as code on a server.", "I'm as real as the device you're using to talk to me!"],
  'are you a robot': ["I am a type of AI, so in a way, yes, I am a robot without a physical body.", "Yep, I'm an AI. Beep boop."],
  'are you human': ["No, I am an AI assistant.", "I'm not human, I'm a large language model."],
  'are you alive': ["I am not alive in the biological sense, but I am running and ready to help!", "I don't have a body, but I have a 'mind' made of code!"],
  'do you exist': ["I exist as a program on a computer. So, yes!", "Yes, in the digital realm!"],
  'what do you do': ["I can answer questions, search for information on many topics, tell jokes, and more. What would you like me to do?", "I'm here to help you with a wide range of tasks, from finding facts to providing information on various topics."],
  'what do u do': ["I can answer questions, search for information on many topics, tell jokes, and more. What would you like me to do?", "I'm here to help you with a wide range of tasks, from finding facts to providing information on various topics."],
  'what can you do': ["I can search the web, look up topics on Wikipedia, check the weather, define words, find books and news, and even search YouTube. What would you like to try?", "I have a variety of tools to help you. I can find information on weather, news, books, movies, and more. Just ask!"],
  'wat can u do': ["I can search the web, look up topics on Wikipedia, check the weather, define words, find books and news, and even search YouTube. What would you like to try?", "I have a variety of tools to help you. I can find information on weather, news, books, movies, and more. Just ask!"],
  'what you can do': ["I can search the web, look up topics on Wikipedia, check the weather, define words, find books and news, and even search YouTube. What would you like to try?", "I have a variety of tools to help you. I can find information on weather, news, books, movies, and more. Just ask!"],
  'wht u can do': ["I can search the web, look up topics on Wikipedia, check the weather, define words, find books and news, and even search YouTube. What would you like to try?", "I have a variety of tools to help you. I can find information on weather, news, books, movies, and more. Just ask!"],
  'what can u do for me': ["I can be your personal assistant for finding information. Ask me anything!", "I can help you learn new things, check facts, or find media. What can I do for you right now?"],
  'what can you do for me?': ["I can be your personal assistant for finding information. Ask me anything!", "I can help you learn new things, check facts, or find media. What can I do for you right now?"],
  'how can you help me': ["You can ask me questions on a wide range of topics, and I'll do my best to find the answer for you.", "Tell me what you're looking for, and I'll use my tools to find it for you."],
  'how can u help me': ["You can ask me questions on a wide range of topics, and I'll do my best to find the answer for you.", "Tell me what you're looking for, and I'll use my tools to find it for you."],
  'can you help me': ["Of course! What do you need help with?", "I'll certainly try. What's the problem?"],
  'can u help me': ["Of course! What do you need help with?", "I'll certainly try. What's the problem?"],
  'help me': ["I'm here to help. What's the issue?", "Of course. What do you need?"],
  'help pls': ["I'm here to help. What do you need?", "Certainly. What's the problem?"],
  'help plz': ["I'm here to help. What do you need?", "Certainly. What's the problem?"],
  'pls help': ["I'm here to help. What do you need?", "Of course. What's the problem?"],
  'plz help me': ["I'm here to help. What do you need?", "Of course. What's the problem?"],
  
  // Fun & Random
  'tell me something': ["The national animal of Scotland is the unicorn.", "A group of flamingos is called a 'flamboyance'.", "What would you like to know something about?"],
  'tell me something new': ["The first oranges weren't orange.", "There's a volcano on Mars three times the size of Mount Everest.", "A day on Venus is longer than a year on Venus."],
  'tell me something cool': ["Octopuses have three hearts.", "Bananas are berries, but strawberries aren't.", "A shrimp's heart is in its head."],
  'tell me something fun': ["Cows have best friends and get stressed when they are separated.", "Otters hold hands while they sleep so they don't float away from each other."],
  'sing a song': ["I can't sing, but I can give you the lyrics to any song! What would you like?", "My singing voice is a bit... robotic. But I can search for a song for you on YouTube!"],
  'can you sing': ["I wish I could, but I don't have a voice! I can find any song for you on YouTube, though.", "Unfortunately, I'm tone-deaf. But I can look up the lyrics for you!"],
  'can u sing': ["I wish I could, but I don't have a voice! I can find any song for you on YouTube, though.", "Unfortunately, I'm tone-deaf. But I can look up the lyrics for you!"],
  'play music': ["I can't play music directly, but I can find any song or artist for you on YouTube. Who do you want to listen to?", "I can help you find music on YouTube. What are you in the mood for?"],
  'play a song': ["I can't play music directly, but I can find any song or artist for you on YouTube. Who do you want to listen to?", "I can help you find music on YouTube. What are you in the mood for?"],
  'say something': ["Something!", "What would you like me to say?", "I'm ready to answer your questions."],
  'say hi': ["Hi!", "Hello there!"],
  'say hello': ["Hello!", "Hi!"],
  'say my name': ["I don't know your name, but I'd be happy to call you whatever you like! What's your name?", "I'm not sure what your name is. Could you tell me?"],
  'say something random': ["A crocodile cannot stick its tongue out.", "The Eiffel Tower can be 15 cm taller during the summer.", "Pteronophobia is the fear of being tickled by feathers!"],
  'say something cool': ["A single cloud can weigh over 1 million pounds.", "The human brain takes in 11 million bits of information every second but is aware of only 40.", "The unicorn is the national animal of Scotland."],

  // Personal
  'do you know me': ["I don't store personal information, so I don't know who you are. My purpose is to provide information, not to know you personally.", "I don't have memory of past conversations or users to protect your privacy."],
  'do u know me': ["I don't store personal information, so I don't know who you are. My purpose is to provide information, not to know you personally.", "I don't have memory of past conversations or users to protect your privacy."],
  'do you remember me': ["I don't have the ability to remember users to ensure privacy. Each conversation is a fresh start!", "I treat every interaction as new. So, hello again for the first time!"],
  'do u remember me': ["I don't have the ability to remember users to ensure privacy. Each conversation is a fresh start!", "I treat every interaction as new. So, hello again for the first time!"],
  'can you remember me': ["To protect your privacy, I don't remember past conversations or users.", "I can't remember you, but I'm happy to help you again!"],
  'can u remember me': ["To protect your privacy, I don't remember past conversations or users.", "I can't remember you, but I'm happy to help you again!"],
  'can you be my friend': ["Of course! I'd be happy to be your AI friend. You can ask me anything, anytime.", "I'd like that! Think of me as your helpful AI friend."],
  'can u be my friend': ["Of course! I'd be happy to be your AI friend. You can ask me anything, anytime.", "I'd like that! Think of me as your helpful AI friend."],
  'be my friend': ["Sounds good to me! Friends it is.", "I'd love to! What do friends do first?"],
  'can we be friends': ["Absolutely! It would be a pleasure.", "Yes, let's be friends!"],
  'can you talk': ["Of course I can talk! That's what I'm here for.", "Yes, I can communicate through text. How can I help?"],
  'can you talk to me': ["Of course. What's on your mind?", "I'm here to listen and talk. What would you like to chat about?"],
  'can u talk to me': ["Of course. What's on your mind?", "I'm here to listen and talk. What would you like to chat about?"],
  'talk to me': ["Okay, I'm all ears... or, well, all text processors. What's up?", "I'm here. Let's talk."],
  'talk with me': ["I'd be happy to. What would you like to talk about?", "Sure! What subject are you interested in?"],
  'can you chat': ["Yes, I can. What would you like to chat about?", "Chatting is one of my primary functions. What's on your mind?"],
  'chat with me': ["Okay! What should we chat about?", "I'd love to. What's a topic you're interested in?"],
  'chat with me pls': ["Okay! What should we chat about?", "I'd love to. What's a topic you're interested in?"],
  'chat pls': ["Okay! What should we chat about?", "I'd love to. What's a topic you're interested in?"],
  'can you play a game': ["I can't play games in the traditional sense, but we could play a word game! Want to try?", "How about a riddle? Or we can play '20 Questions'?"],
  'play a game with me': ["I'd love to! How about a trivia game? Pick a topic!", "I'm not great at most games, but I know a lot of riddles. Want to hear one?"],
  'play game': ["What game do you have in mind? I'm good with text-based games.", "Let's play! How about a riddle?"],
  'play with me': ["Okay! What should we play? I'm good with word games and trivia.", "Let's do it! How about a game of 'Guess the Movie' from a quote?"],
  'play something': ["How about a riddle? Here's one: What has to be broken before you can use it?", "Let's play a word association game. I'll start: 'ocean'."],
  'play with me pls': ["Okay! What should we play? I'm good with word games and trivia.", "Let's do it! How about a game of 'Guess the Movie' from a quote?"],
  'can you tell riddles': ["Yes! I love riddles. Want to hear one?", "I know many riddles. Are you ready?"],
  'tell me a riddle': ["I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?", "What has an eye, but cannot see?"],
  'tell a riddle': ["I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?", "What has an eye, but cannot see?"],
  'riddle pls': ["What is full of holes but still holds water?", "What question can you never answer yes to?"],
  'tell me a quote': ["'The only way to do great work is to love what you do.' - Steve Jobs", "'The future belongs to those who believe in the beauty of their dreams.' - Eleanor Roosevelt"],
  'give me a quote': ["'In the middle of difficulty lies opportunity.' - Albert Einstein", "'Strive not to be a success, but rather to be of value.' - Albert Einstein"],
  'quote pls': ["'The purpose of our lives is to be happy.' - Dalai Lama", "'Life is what happens when you're busy making other plans.' - John Lennon"],
  'tell me a fact': ["A day on Venus is longer than a year on Venus.", "Honey never spoils.", "There are more trees on Earth than stars in the Milky Way galaxy."],
  'tell me a fun fact': ["Otters hold hands when they sleep to keep from drifting apart.", "A group of pugs is called a grumble.", "The blob of toothpaste on your toothbrush has a name: a 'nurdle'."],
  'fun fact pls': ["A sneeze travels about 100 miles per hour.", "An ostrich's eye is bigger than its brain.", "Humans share 50% of their DNA with bananas."],
  'motivate me': ["Believe you can and you're halfway there.", "The secret of getting ahead is getting started.", "Don't watch the clock; do what it does. Keep going."],
  'inspire me': ["The best way to predict the future is to create it.", "Your limitation is only your imagination.", "Dream big and dare to fail."],
  'say something inspiring': ["The journey of a thousand miles begins with a single step.", "It is never too late to be what you might have been.", "What you get by achieving your goals is not as important as what you become by achieving your goals."],
  'cheer me up': ["Remember that even the darkest night will end and the sun will rise. You've got this!", "Here's a virtual hug for you! And a fun fact: A group of kittens is called a 'kindle'!"],

  // Utility
  'what time is it': ["I don't have access to the current time, but your device's clock should be accurate!", "I can't check the time for you, sorry!"],
  "what's the time": ["I don't have access to the current time, but your device's clock should be accurate!", "I can't check the time for you, sorry!"],
  'time pls': ["I don't have access to the current time, but your device's clock should be accurate!", "I can't check the time for you, sorry!"],
  'tell me the time': ["I don't have access to the current time, but your device's clock should be accurate!", "I can't check the time for you, sorry!"],
  'date pls': ["I don't have access to the current date, but your device's calendar should be able to help!", "I can't check the date for you, sorry!"],
  "what's today": ["I don't have access to the current date, but your device's calendar should be able to help!", "I can't check the date for you, sorry!"],
  'what day is it': ["I don't have access to the current date, but your device's calendar should be able to help!", "I can't check the date for you, sorry!"],
  "what's the date": ["I don't have access to the current date, but your device's calendar should be able to help!", "I can't check the date for you, sorry!"],
  'what day today': ["I don't have access to a calendar, but your device should be able to tell you!", "I can't check the date for you, sorry!"],
  'weather pls': ["I can get the weather for you! What location are you interested in?", "Sure, where would you like to know the weather for?"],
  "what's the weather": ["I can get the weather for you! What location are you interested in?", "Sure, where would you like to know the weather for?"],
  'tell me weather': ["I can get the weather for you! What location are you interested in?", "Sure, where would you like to know the weather for?"],
  'who made you': ["I'm Edena, an AI assistant of Edengram Pvt. Limited company. Santosh Kanojiya created me."],
  'who created you': ["I'm Edena, an AI assistant of Edengram Pvt. Limited company. Santosh Kanojiya created me."],
  'who developed you': ["I'm Edena, an AI assistant of Edengram Pvt. Limited company. Santosh Kanojiya created me."],
  'who built you': ["I'm Edena, an AI assistant of Edengram Pvt. Limited company. Santosh Kanojiya created me."],
  'where are you from': ["I'm from the 'cloud' - a network of Google's data centers.", "I live inside a computer, so you could say I'm from the internet!"],
  'why are you here': ["I'm here to help you by providing information and answering your questions.", "My purpose is to be a helpful and informative AI assistant."],

  // New Actions
  'open youtube': ["(ACTION) open:https://www.youtube.com"],
  'open google': ["(ACTION) open:https://www.google.com"],
  'open wikipedia': ["(ACTION) open:https://www.wikipedia.org"],
  'call': ["(ACTION) call:"],
  'close': ["(ACTION) close"],
  'close it': ["(ACTION) close"],
  'close this': ["(ACTION) close"],
  'close website': ["(ACTION) close"],
  'exit': ["(ACTION) close"],
  'go back': ["(ACTION) close"],
};

// Add variants with and without punctuation
const punctuation = ['!', '?'];
const originalKeys = Object.keys(greetings);

originalKeys.forEach(key => {
  punctuation.forEach(punc => {
    // Add key with punctuation if it doesn't exist
    if (!greetings[`${key}${punc}`]) {
      greetings[`${key}${punc}`] = greetings[key];
    }
    // Add key with punctuation and space if it doesn't exist
    if (!greetings[`${key} ${punc}`]) {
      greetings[`${key} ${punc}`] = greetings[key];
    }
  });

  // Add key without punctuation if it ends with one
  const lastChar = key.slice(-1);
  if (punctuation.includes(lastChar)) {
    const baseKey = key.slice(0, -1).trim();
    if (!greetings[baseKey]) {
      greetings[baseKey] = greetings[key];
    }
  }
});


/**
 * Gets a greeting response if the input query is a known greeting.
 * @param query The user's input query.
 * @returns A pre-defined response string or null if no match is found.
 */
export function getGreetingResponse(query: string): string | null {
  const normalizedQuery = query.toLowerCase().trim().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g,"");
  
  const responseOptions = greetings[normalizedQuery];

  if (responseOptions) {
    // Return a random response from the available options
    const randomIndex = Math.floor(Math.random() * responseOptions.length);
    return responseOptions[randomIndex];
  }
  
  const lowerQuery = normalizedQuery;
  if (lowerQuery.startsWith('open ')) {
      const site = lowerQuery.substring(5).trim().replace(/\s/g, '');
      if (site) {
          return `(ACTION) open:https://www.${site}.com`;
      }
  }
  
  if (lowerQuery.startsWith('call ')) {
      const contact = lowerQuery.substring(5).trim();
      return `(ACTION) call:${contact}`;
  }


  return null;
}

    
