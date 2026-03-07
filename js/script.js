// Global references that will be accessed frequently.
const partyNumberInput = document.getElementById('partyNumber');

// Global variables.
let lootList = []; // Set up the loot list array.
let partySize = 1; // Global variable for the party size.


// Class for creating individual items of loot, and provides a couple of nice features.
class LootItem {
    constructor(name, value = 0.0, quantity = 1, rarity = 1) {
        this.name = name;
        this.quantity = quantity;
        this.value = value;

        // Default rarity value to the standard "common" just in case an invalid value gets snuck in.
        this.rarity = Number(rarity);
        if (isNaN(this.rarity)) this.rarity = 1;
    }

    // Returns an item's base value modified by an amount congruent with higher "tiers" of rarity/quality.
    // This "rarity" setup is more inspired by MMORPG quality tiers.
    get rarityValue() {
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


// A simple class for storing the loot given to player-characters.7
class PlayerCharacter {
    constructor(playerNumber, loot = []) {
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
// This does not modify the array passed to it.
function shuffleArray(arrayToShuffle) {
    // Bail out if the array length is 1 or less. No sense in trying to shuffle a size 1 or 0 array.
    if (arrayToShuffle.length <= 1) return arrayToShuffle;

    // Duplicate the array because we're about to mess with it.
    let shuffled = arrayToShuffle.slice();

    // Fisher-Yates shuffle. This is way more efficient than what I'd originally come up with.
    // My original algorithm involved getting a random number and splicing the original array.
    // It worked, but it was quite ugly.
    for (let i = arrayToShuffle.length - 1; i > 0; i--) {
        const rand = Math.floor(Math.random() * (i + 1)); // Get a random integer 
        [shuffled[i], shuffled[rand]] = [shuffled[rand], shuffled[i]]; // Swaps the two objects in place.
    }

    return shuffled;
}


// This function looks at how many pieces of loot are available, looks at how many players have been defined,
// then does a simple division for loot distribution. Of course, if there are more players than loot then
// some players may not get any (will be a float less than 1.0).
function splitLoot() {
    document.getElementById('totalLoot').innerText = lootList.length;
    document.getElementById('lootPerPlayer').innerText = lootList.length / partySize;

    if (lootList.length === 0) {
        document.getElementById('lootSplitOutput').style.display = "none";
    } else {
        document.getElementById('lootSplitOutput').style.display = "block";
    }
}


// Creates the table rows for the loot list table and unhides it.
function renderLoot() {
    let lootTable = document.getElementById('lootTable'); // Get a reference to the table in the DOM.
    
    // When updating the loot table, if the length is zero we just blank it out, hide it, and bail.
    if (lootList.length === 0) {
        lootTable.style.display = "none";
        lootTable.innerHTML = "";
        document.getElementById('no-loot-message').style.display = "block";
        updateUI();
        return;
    }

    // We want to total up the base and rarity/quality values for all of the loot.
    let totalLootBaseValue = 0.0;
    let totalLootRarityValue = 0.0;

    let lootTableElements = `<tr>
                    <th>
                        Item Name
                    </th>

                    <th>
                        Quantity
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

    // Loop through each loot item in lootList, total up values, and build a new row for it in the loot table.
    for (const [index, item] of lootList.entries()) {
        totalLootBaseValue += item.value;
        totalLootRarityValue += item.rarityValue;
        lootTableElements += `
        <tr>
            <td>${item.name}</td>
            <td>${item.quantity}</td>
            <td>${item.rarityName}</td>
            <td>${item.value.toFixed(2)}</td>
            <td>${item.rarityValue.toFixed(2)}</td>
            <td><button class="removeFromLootButton" onClick="removeFromLootTable(${index})">❌</button></td>
        </tr>
        `
    }


    //<td><span class="removeFromLootButton" onClick="removeFromLootTable(${index})">❌</span></td>

    // Now load a new row with the totals.
    lootTableElements += `
    <tr><td colspan="7">&nbsp;</td></tr>
    <tr>
        <td><b>Totals:</b></td>
        <td>${lootList.length}</td>
        <td></td>
        <td>${totalLootBaseValue.toFixed(2)}</td>
        <td>${totalLootRarityValue.toFixed(2)}</td>
        <td></td>
    </tr>
    `

    document.getElementById('no-loot-message').style.display = "none"; // We want to hide the "no loot to display" message.

    lootTable.innerHTML = lootTableElements;
    lootTable.style.display = "table";

    updateUI();
}


// This adds loot to the lootList global array, using the name, value, and quality/rarity selector.
// This makes use of a custom class I created to construct the loot object.
function addLoot() {
    let lootForm = document.querySelector('#lootForm'); // Get a reference to the loot form itself.
    let itemName = lootForm.elements['lootname'].value.trim(); // Make sure we trim whitespace from the name.

    // No adding loot with a blank name or just numbers.
    if (itemName === "") return;
    if (!isNaN(Number(itemName))) return;

    let itemValue = lootForm.elements['lootvalue'].value;
    let itemRarity = lootForm.elements['lootquality'].value;

    // Do a bit of sanity check. In the event the loot value isn't a number, default to zero.
    // If it's a negative number, will do the absolute value instead. No negative value allowed!
    itemValue = Number(Math.abs(itemValue))
    if (isNaN(this.itemValue)) this.itemValue = 0.0;
    
    // Construct the new loot item using our custom class using the name, value, and rarity, and push it onto the array.
    let newLoot = new LootItem(itemName, itemValue, itemRarity);
    lootList.push(newLoot);

    renderLoot();   
}


function removeFromLootTable(index) {
    if (isNaN(Number(index)) || index === null) return; // Bail out in the event of a bad index value. This shouldn't happen but with JavaScript you never know.
    lootList.splice(index, 1); // Splices out the index of the loot passed into it, therefore removing it from the array.
    renderLoot();
}


// For certain validation where the minimum value must be 1 or greater.
// Returns an array. First element is validated value, second element is if the passed in value was valid.
function forcePositiveNonZeroInteger(numberToMakeValid) {
    const validNumber = Number(numberToMakeValid);

    // If it's not a number or equal to zero, snap to 1.
    if (isNaN(validNumber) || validNumber === 0 ) return [1, false];

    // No negative values. Sets the input to the absolute value of what was entered.
    if (validNumber < 0) return [Math.abs(validNumber), false];

    // Is the value entered an integer? If not, truncate it.
    if (!Number.isInteger(validNumber)) return [Math.trunc(validNumber), false];

    return [validNumber, true];
}


// Validation method for the party size input box. Is called every time the input is updated.
// Handles the user entering non-numbers, negative numbers, or floats into the input.
function validatePartySize() {
    let wasInputValid = true;
    [partySize, wasInputValid] = forcePositiveNonZeroInteger(partyNumberInput.value);

    if (!wasInputValid) {
        document.getElementById('partyNumber').value = partySize;
        document.getElementById('invalid-party-size-message').style.display = "inline";
    } else {
        document.getElementById('invalid-party-size-message').style.display = "none";
    }
}


// A debug function for quickly adding a random set of loot to the loot table without needing to enter things manually.
// Also assigns a random value and rarity.
function debugRandomLoot() {
    const itemNames = ["Pendant", "Ring", "Coin", "Dagger", "Torch", "Rope", "Satchel", "Flask", "Map", "Compass", "Key", "Scroll", "Lantern", "Hammer", "Chisel", "Bowl", "Cup", "Cloak", "Boots", "Gloves", "Belt", "Pouch", "Quill", "Book", "Mirror"]
    let randomNumberOfItems = Math.floor(Math.random() * 5) + 6;

    lootList = [];

    for (let i = 0; i < randomNumberOfItems; i++) {
        let randomLootName = itemNames[Math.floor(Math.random() * itemNames.length)];
        let randomQuantity = Math.floor(Math.random() * 5) + 1;
        let randomValue = Number((Math.random() * 10).toFixed(2));
        let randomRarity = Math.floor(Math.random() * 5);
        let newLoot = new LootItem(randomLootName, randomValue, randomQuantity, randomRarity);
        lootList.push(newLoot);
    }

    renderLoot();
}


function updateUI() {
    validatePartySize();
    splitLoot();

    if (lootList.length === 0) {
        document.getElementById('splitLootButton').setAttribute("disabled", "true");
    } else {
        document.getElementById('splitLootButton').removeAttribute("disabled");
    }
}


// Set up the event listeners for the buttons.
document.getElementById('addLootButton').addEventListener('click', addLoot);
document.getElementById('splitLootButton').addEventListener('click', splitLoot);
document.getElementById('partyNumber').addEventListener('change', updateUI);
document.getElementById('debugRandomLoot').addEventListener('click', debugRandomLoot);