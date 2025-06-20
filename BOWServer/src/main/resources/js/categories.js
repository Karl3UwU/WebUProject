const genres = {
    FANTASY: "Magic, mythical creatures, and epic adventures.",
    SCIENCE_FICTION: "Futuristic tech, space travel, and scientific speculation.",
    MYSTERY: "Investigations, secrets, and unsolved crimes.",
    THRILLER: "Fast-paced, tense, and full of suspense.",
    ROMANCE: "Emotional love stories and relationships.",
    HORROR: "Terrifying tales of the supernatural and unknown.",
    YOUNG_ADULT: "Coming-of-age stories for teen readers.",
    CHILDREN_FICTION: "Stories for young readers with fun and lessons.",
    BIOGRAPHY: "Real stories of remarkable people's lives.",
    AUTOBIOGRAPHY: "People telling their own life story.",
    HISTORY: "Books rooted in past events and civilizations.",
    SELF_HELP: "Guides to improve life, mindset, and productivity.",
    SCIENCE: "Books about the natural world and discoveries.",
    TRAVEL: "Adventures, cultures, and destinations around the world.",
    CYBERPUNK: "Dystopian futures with high tech and low life.",
    CLASSIC: "Timeless literature that shaped the literary world.",
    MEMOIR: "Personal reflections and lived experiences.",
    DRAMA: "Emotion-driven stories often exploring real conflicts.",
    HUMOR: "Light-hearted, funny books to make you laugh.",
    FICTION: "Imaginative storytelling across genres.",
    PHILOSOPHY: "Thought-provoking texts on life, ethics, and existence."
};

const grid = document.getElementById("genresGrid");

Object.entries(genres).forEach(([key, description]) => {
    const readableName = key
        .toLowerCase()
        .replace(/_/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase());

    const card = document.createElement("div");
    card.className = "genre-card";
    card.innerHTML = `
    <h3>${readableName}</h3>
    <p class="genre-description">${description}</p>
  `;
    card.addEventListener("click", () => {
        const formattedKey = key.charAt(0).toUpperCase() + key.slice(1).toLowerCase();
        sessionStorage.setItem("selectedGenre", formattedKey);
        window.location.href = "browse.html";
    });
    grid.appendChild(card);
});
