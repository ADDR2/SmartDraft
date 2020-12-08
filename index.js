const knowledge = require('./knowledge.json');

function isValid(heroe = {}, query = {}) {
    const {
        role,
        canSoakWell,
        canBurst,
        doesPercentageDmg,
        hasGlobalMobility,
        canRepairStructures,
        bans = [],
        allyPicks = [],
        enemyPicks = []
    } = query;

    return (role ? role === heroe.role : true) &&
        (canSoakWell !== undefined ? heroe.canSoakWell : true) &&
        (canBurst !== undefined ? heroe.canBurst : true) &&
        (doesPercentageDmg !== undefined ? heroe.doesPercentageDmg : true) &&
        (hasGlobalMobility !== undefined ? heroe.hasGlobalMobility : true) &&
        (canRepairStructures !== undefined ? heroe.canRepairStructures : true) &&
        !bans.includes(heroe.id) &&
        !allyPicks.includes(heroe.id) &&
        !enemyPicks.includes(heroe.id)
    ;
}

function evaluateHeroe(heroe = {}, allyPicks, enemyPicks, mapId) {
    let sum = 0;

    sum += allyPicks.reduce((total, pickId) => {
        const goodSinergyAmount = (pickId in heroe.goodSinergy) && !(pickId in heroe.badSinergy) ? heroe.goodSinergy[pickId].amount : 0;
        const badSinergyAmount = (pickId in heroe.badSinergy) && !(pickId in heroe.goodSinergy) ? heroe.badSinergy[pickId].amount : 0;

        return total + goodSinergyAmount + badSinergyAmount;
    });

    sum += enemyPicks.reduce((total, pickId) => {
        const goodAgainstAmount = (pickId in heroe.goodAgainst) && !(pickId in heroe.badAgainst) ? heroe.goodAgainst[pickId].amount : 0;
        const badAgainstAmount = (pickId in heroe.badAgainst) && !(pickId in heroe.goodAgainst) ? heroe.badAgainst[pickId].amount : 0;

        return total + goodAgainstAmount + badAgainstAmount;
    });

    const goodMapAmount = (mapId in heroe.goodIn) && !(mapId in heroe.badIn) ? heroe.goodIn[mapId].amount : 0;
    const badMapAmount = (mapId in heroe.badIn) && !(mapId in heroe.goodIn) ? heroe.badIn[mapId].amount : 0;

    sum += goodMapAmount + badMapAmount;

    return {
        id: heroe.id,
        name: heroe.name,
        role: heroe.role,
        points: sum
    };
}

function search(query) {
    const {
        allyPicks = [],
        enemyPicks = [],
        mapId = ""
    } = query;
    const result = [];

    for (const heroe of knowledge) {        
        isValid(heroe, query) && result.push(evaluateHeroe(heroe, allyPicks, enemyPicks, mapId));
    }

    return result.sort(({ points: pointsA }, { points: pointsB }) => (
        pointsB > pointsA ? -1 : (pointsB < pointsA)
    ));
}