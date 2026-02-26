let lootList = []; // Set up the loot list array.

class LootItem {
    constructor(name, value = 0.0, rarity = 1) {
        this.name = name;

        this.value = Number(Math.abs(value))
        if (isNaN(this.value)) this.value = 0.0;

        this.rarity = Number(rarity);
        if (isNaN(this.rarity)) this.rarity = 0;
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
}

for (let i = 0; i < 10; i++) {
    let randomValue = Number((Math.random() * 10).toFixed(2));
    let newLoot = new LootItem("Doohickey", randomValue);
    lootList.push(newLoot);
}

console.log(lootList);

let totalValue = 0.0;
for (item of lootList) {
    console.log(item);
    totalValue += item.rarityValue;
}

console.log(totalValue.toFixed(2));