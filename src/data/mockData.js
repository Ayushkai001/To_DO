export const subjects = [
    {
        id: 'math',
        title: 'Mathematics',
        children: [
            {
                id: 'calc',
                title: 'Calculus',
                children: [
                    {
                        id: 'limits',
                        title: 'Limits',
                        status: 'review_due', // 'learned', 'review_due', 'new'
                        nextReview: 'Today',
                        priority: 'high',
                        completed: false,
                        details: 'Review epsilon-delta definition of limits.'
                    },
                    {
                        id: 'deriv',
                        title: 'Derivatives',
                        status: 'learned',
                        nextReview: '3d',
                        priority: 'medium',
                        completed: true,
                        details: 'Practice chain rule problems.'
                    }
                ]
            }
        ]
    },
    {
        id: 'cs',
        title: 'Computer Science',
        children: [
            {
                id: 'algo',
                title: 'Algorithms',
                children: [
                    {
                        id: 'dp',
                        title: 'Dynamic Programming',
                        status: 'review_due',
                        nextReview: 'Today',
                        priority: 'high',
                        completed: false,
                        details: 'Solve the Knapsack problem variant.'
                    }
                ]
            }
        ]
    },
    {
        id: 'lang',
        title: 'Languages',
        children: [
            {
                id: 'jp',
                title: 'Japanese',
                children: [
                    {
                        id: 'kanji',
                        title: 'Kanji N3',
                        status: 'learned',
                        nextReview: '1w',
                        priority: 'low',
                        completed: false,
                        details: 'Review flashcards 100-150.'
                    }
                ]
            }
        ]
    }
];

// Helper to flatten the tree for the "Today" view
export const getTodaysTopics = () => {
    const todaysTopics = [];

    const traverse = (nodes, path = []) => {
        nodes.forEach(node => {
            const currentPath = [...path, node.title];
            if (node.children) {
                traverse(node.children, currentPath);
            } else {
                // Condition for "Today": status is 'review_due' or priority is 'high'
                if (node.nextReview === 'Today' || node.status === 'review_due') {
                    todaysTopics.push({
                        ...node,
                        path: currentPath.slice(0, -1) // Exclude self from path
                    });
                }
            }
        });
    };

    traverse(subjects);
    return todaysTopics;
};
