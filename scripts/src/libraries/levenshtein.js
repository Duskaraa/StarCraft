function levenshtein(a, b) {
    const alen = a.length;
    const blen = b.length;
    const matrix = Array.from({ length: alen + 1 }, (_, i) => Array(blen + 1).fill(0));
    
    for (let i = 0; i <= alen; i++) matrix[i][0] = i;
    for (let j = 0; j <= blen; j++) matrix[0][j] = j;
    
    for (let i = 1; i <= alen; i++) {
        for (let j = 1; j <= blen; j++) {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;
            matrix[i][j] = Math.min(
                matrix[i - 1][j] + 1, 
                matrix[i][j - 1] + 1,
                matrix[i - 1][j - 1] + cost 
            );
        }
    }
    
    return matrix[alen][blen];
  }
  
  function findClosestCommand(input, commands, threshold = 5) {
    let closest = null;
    let minDistance = Infinity;
  
    for (const command of commands) {
        const nameDistance = levenshtein(input, command.name);
        if (nameDistance < minDistance) {
            minDistance = nameDistance;
            closest = command;
        }
  
        if (command.aliases) {
            for (const alias of command.aliases) {
                const aliasDistance = levenshtein(input, alias);
                if (aliasDistance < minDistance) {
                    minDistance = aliasDistance;
                    closest = command;
                }
            }
        }
    }
  
    return minDistance <= threshold ? closest : null;
  }
  
  export { findClosestCommand };
  