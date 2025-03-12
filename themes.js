const themes = [
  {
    theme: "The Power of Honesty",
    description:
      "Main characters face a problem caused by a small lie, learn the value of telling the truth, and fix things by being honest.",
  },
  {
    theme: "Kindness Wins the Day",
    description:
      "Main characters help someone in need, even when it's hard, and discover that kindness brings unexpected rewards.",
  },
  {
    theme: "Teamwork Makes the Dream Work",
    description:
      "Main characters with different skills must work together to overcome a challenge, learning that cooperation is stronger than going it alone.",
  },
  {
    theme: "The Joy of Sharing",
    description:
      "Main characters learn that sharing what they have, even if it's small, makes everyone happier, including themselves.",
  },
  {
    theme: "Courage to Try",
    description:
      "Main characters face a fear or challenge, take a brave step, and realize they're stronger than they thought.",
  },
  {
    theme: "The Adventure of Self-Discovery",
    description:
      "Characters go on journeys—often both literal and metaphorical—where they learn about their unique strengths, passions, and values. They come out transformed.",
  },
  {
    theme: "Lessons from Nature",
    description:
      "The characters learn from nature, including animals and the environment. Animals, bugs, and plants can represent archetypes such as cleverness, wisdom, etc.",
  },
  {
    theme: "The Tale of the Tiny Hero",
    description:
      "Main characters, though small or unlikely, overcome daunting challenges, proving that courage and determination can make anyone a hero.",
  },
  {
    theme: "The Chronicles of Perseverance",
    description:
      "Main characters face setbacks and obstacles, discovering that persistence and hard work turn failures into stepping stones for success.",
  },
  {
    theme: "The Power of Imagination",
    description:
      "Main characters use creative thinking to solve problems and build magical worlds, proving that dreams and creativity can change their reality.",
  },
  {
    theme: "The Importance of Family",
    description:
      "Characters discover that family support is essential and helps them overcome obstacles.",
  },
  {
    theme: "The Quest for Knowledge",
    description:
      "Main characters venture into unknown lands filled with puzzles and mysteries, discovering that curiosity opens doors to new worlds.",
  },
];

const getRandomTheme = () => themes[Math.floor(Math.random() * themes.length)];

module.exports = getRandomTheme;
