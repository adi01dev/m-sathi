
export const moodEmojis = {
  joyful: "😄",
  happy: "😊",
  calm: "😌",
  relaxed: "🧘",
  neutral: "😐",
  anxious: "😰",
  stressed: "😫",
  sad: "😢",
  depressed: "😔"
};

export const getMoodColor = (score: number): string => {
  if (score >= 9) return "bg-emerald-500";
  if (score >= 7) return "bg-green-500";
  if (score >= 5) return "bg-blue-500";
  if (score >= 3) return "bg-amber-500";
  return "bg-red-500";
};

export const moodQuotes = {
  joyful: [
    "जीवन का आनंद लेना सबसे बड़ी कला है। (Taking joy in life is the greatest art.)",
    "खुशी एक ऐसी चीज़ है जो बांटने से बढ़ती है। (Happiness is something that multiplies when shared.)",
    "आज का दिन आपके लिए खुशियों भरा हो। (May today be filled with joy for you.)"
  ],
  happy: [
    "प्रसन्नता आपके चेहरे पर सबसे अच्छा दिखने वाला मेकअप है। (Happiness is the best makeup you can wear.)",
    "छोटी खुशियों में भी बड़े आनंद की अनुभूति होती है। (There is great joy in small moments of happiness.)",
    "खुश रहने का निर्णय आप खुद लेते हैं। (You decide to be happy.)"
  ],
  calm: [
    "शांति आपके भीतर है, बाहर नहीं। (Peace is within, not outside.)",
    "जब मन शांत होता है, तब सब कुछ संभव होता है। (When the mind is calm, everything is possible.)",
    "शांत मन, स्वस्थ जीवन का आधार है। (A calm mind is the foundation of a healthy life.)"
  ],
  relaxed: [
    "आराम करना, जीवन जीना सीखना है। (Learning to relax is learning to live.)",
    "तनाव को छोड़ें, आराम को अपनाएं। (Let go of tension, embrace relaxation.)",
    "सांस लें, छोड़ें, और सहज हो जाएं। (Breathe in, breathe out, and be at ease.)"
  ],
  neutral: [
    "संतुलन ही जीवन की कुंजी है। (Balance is the key to life.)",
    "हर दिन एक नया अवसर लेकर आता है। (Each day brings a new opportunity.)",
    "न बहुत खुश, न उदास - शांति का मार्ग। (Neither too happy nor sad - the path of peace.)"
  ],
  anxious: [
    "चिंता भविष्य के बारे में है, अभी को जीएं। (Anxiety is about the future, live in the now.)",
    "एक गहरी सांस लें, सब ठीक हो जाएगा। (Take a deep breath, everything will be okay.)",
    "चिंता करना समस्या का हल नहीं है। (Worrying doesn't solve problems.)"
  ],
  stressed: [
    "तनाव को पहचानना ही उसे हराने का पहला कदम है। (Recognizing stress is the first step to defeating it.)",
    "अपने आप को समय दें, हर समस्या का हल होता है। (Give yourself time, every problem has a solution.)",
    "तनाव को आराम से बदलें, एक कदम एक बार। (Replace stress with relaxation, one step at a time.)"
  ],
  sad: [
    "दुःख भी एक शिक्षक है, धैर्य रखें। (Sadness too is a teacher, have patience.)",
    "हर अंधेरी रात के बाद सूरज निकलता है। (The sun rises after every dark night.)",
    "अपने आंसुओं को ताकत में बदलें। (Turn your tears into strength.)"
  ],
  depressed: [
    "अंधेरा कितना भी गहरा हो, प्रकाश हमेशा मौजूद है। (No matter how deep the darkness, light is always present.)",
    "आप अकेले नहीं हैं, मदद मांगना साहस है। (You are not alone, asking for help is courage.)",
    "एक छोटा कदम भी आगे बढ़ने की जीत है। (Even a small step forward is a victory.)"
  ]
};

export const getRandomQuote = (mood: string): string => {
  const moodKey = mood as keyof typeof moodQuotes;
  const quotes = moodQuotes[moodKey] || moodQuotes.neutral;
  return quotes[Math.floor(Math.random() * quotes.length)];
};
