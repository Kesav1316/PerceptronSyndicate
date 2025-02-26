const fetchProjectIdeas = async (topic) => {
    try {
        const response = await fetch("http://127.0.0.1:5007/generate-ideas", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ topic })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        return data.ideas || [];
    } catch (error) {
        console.error("Error fetching project ideas:", error);
        return ["Error fetching project ideas. Try again later."];
    }
};

export default fetchProjectIdeas;
