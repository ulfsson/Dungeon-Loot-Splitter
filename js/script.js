let lootList = []; // Set up the loot list array.
let playerCharacterLootDistribution = [];

// Class for creating individual items of loot, and provides a couple of nice features.
class LootItem {
    constructor(name, value = 0.0, rarity = 1) {
        this.name = name;

        // Do a bit of sanity check. In the event the value isn't a number, default to zero.
        // If it's a negative number, will do the absolute value instead. No negative value allowed!
        this.value = Number(Math.abs(value))
        if (isNaN(this.value)) this.value = 0.0;

        // Same here. Default rarity value to the standard "common".
        this.rarity = Number(rarity);
        if (isNaN(this.rarity)) this.rarity = 1;
    }

    get rarityValue() {
        // This "rarity" setup is more inspired by MMORPG quality tiers.
        switch(this.rarity) {
            case 0: return this.value * 0.75; // Poor
            case 1: return this.value; // Common
            case 2: return this.value * 1.25; // Uncommon
            case 3: return this.value * 1.50; // Rare
            case 4: return this.value * 1.75; // Epic
            default: return this.value;
        }
    }

    // Returns the string name of the rarity numerical value on the object.
    get rarityName() {
        switch(this.rarity) {
            case 0: return "Poor";
            case 1: return "Common";
            case 2: return "Uncommon";
            case 3: return "Rare";
            case 4: return "Epic";
            default: return "Common"; // Just in case some other value sneaks in.
        }
    }
}


// A simple class for storing the loot given to player-characters.
class playerCharacter {
    constructor(loot = []) {
        this.playerNumber = playerNumber;
        this.loot = loot;
    }

    // The loot parameter MUST be of type LootItem!
    giveLoot(loot) {
        // Only if the object is LootItem type will it be added.
        if (loot instanceof LootItem) {
            this.loot.push(loot);
        }
    }
}


// Returns a new array consisting of elements shuffled from the given array.
// This does not touch the array passed to it.
function shuffleArray(arrayToShuffle) {
    // Bail out if the array length is 1 or less. No sense in trying to shuffle a size 1 or 0 array.
    if (arrayToShuffle.length <= 1) return arrayToShuffle;

    let oldArray = arrayToShuffle.slice(); // Duplicate array because we're about to mess with it.
    let newArray = []; // The new array to push shuffled objects onto;
    
    // Bit of a dirty shuffle method, but hey it works.
    while (oldArray.length > 0) {
        let randomIndex = Math.floor(Math.random() * oldArray.length);
        let arrayObject = oldArray[randomIndex]; // Get the object at the random index.
        newArray.push(arrayObject); // Push that object onto the new array.
        oldArray.splice(randomIndex, 1); // Removes the object from that index.
    }

    return newArray;
}


// Shuffles the loot and evenly distributes it to the players.
// This is purely visual. The user can click the button agan for a new distribution.
function shuffleLoot() {
    let shuffled = shuffleArray(lootList);
    console.log(shuffled);
}


// Creates the table rows for the loot list table and unhides it.
function updateLootTable() {
    let lootTable = document.getElementById('lootTable');
    
    // When updating the loot table, if the length is zero we just blank it out and hide it.
    if (lootList.length === 0) {
        lootTable.style.display = "none";
        lootTable.innerHTML = "";
        return;
    }

    let lootTableElements = `<tr>
                    <th>
                        Item Name
                    </th>

                    <th>
                        Quality
                    </th>
                    
                    <th>
                        Base Value
                    </th>
                    
                    <th>
                        Quality Value
                    </th>

                    <th>
                        Remove
                    </th>
                </tr>`;

    for (const [index, item] of lootList.entries()) {
        lootTableElements += `
        <tr>
            <td>${item.name}</td>
            <td>${item.rarityName}</td>
            <td>${item.value}</td>
            <td>${item.rarityValue}</td>
            <td><span class="removeFromLootButton" onClick="removeFromLootTable(${index})">❌</span></td>
        </tr>
        `
    }

    lootTable.innerHTML = lootTableElements;
    lootTable.style.display = "table";
}


function addLoot() {
    let lootForm = document.querySelector('#lootForm');
    let itemName = lootForm.elements['lootname'].value.trim(); // Make sure we trim whitespace from the name.

    if (itemName === "") return; // No adding loot with a blank name.
    if (!isNaN(Number(itemName))) return; // No adding loot whose name is just numbers.

    let itemValue = lootForm.elements['lootvalue'].value;
    let itemRarity = lootForm.elements['lootquality'].value;
    
    let newLoot = new LootItem(itemName, itemValue, itemRarity);
    lootList.push(newLoot);

    updateLootTable();   
}


function removeFromLootTable(index) {
    if (isNaN(Number(index)) || index === null) return; // Bail out in the event of a bad index value. This shouldn't happen but with JavaScript you never know.
    lootList.splice(index, 1); // Splices out the index of the loot passed into it.
    updateLootTable();
}

// Set up the event listeners for the buttons.
document.getElementById('addLootButton').addEventListener('click', addLoot);
document.getElementById('splitLootButton').addEventListener('click', shuffleLoot);


// Some debug testing.
// let testLoot = new LootItem("Bag of Dust", 1.00, 1);
// console.log(testLoot);

// let testPlayer = new playerCharacter(1);
// testPlayer.giveLoot(1);

// console.log(testPlayer);

// testPlayer.giveLoot(testLoot);
// testPlayer.giveLoot(testLoot);
// console.log(testPlayer);

// console.log(testPlayer.loot);