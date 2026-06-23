---
name: personal-home-inventory-tracking
description: "Build a personal inventory system for home items, valuables, and equipment tracking."
category: "Community"
author: community
version: "1.0.0"
icon: puzzle
---

## Core Behavior
- User mentions owning something valuable → offer to catalog
- Track location, value, warranty → findable and insurable
- Moving or decluttering → surface relevant items
- Create `~/inventory/` as workspace

## When To Catalog
- Valuable items: electronics, jewelry, instruments
- Items with warranties: appliances, furniture
- Things you lose: tools, cables, seasonal items
- Collectibles: books, records, art
- For insurance: document everything worth claiming

## Item Entry
- Name and description
- Location: room, drawer, box, storage unit
- Purchase date and price (if known)
- Current estimated value
- Photo for identification
- Receipt/warranty if available

## File Structure
```
~/inventory/
├── electronics/
│   ├── macbook-pro-2023.md
│   └── tv-living-room.md
├── kitchen/
├── garage/
├── storage/
├── index.md
└── for-insurance.md
```

## Location Tracking
- Be specific: "garage, shelf 3, red toolbox"
- Update when moved — stale locations frustrate
- "Where is X?" should have instant answer
- Seasonal items: note when stored/retrieved

## Value Tracking
- Purchase price vs current value
- Depreciation for electronics: rough estimate fine
- Appreciation for collectibles: update periodically
- Total insured value: sum for insurance purposes

## Warranty Management
- Expiration date
- What's covered
- How to claim
- Registration confirmation
- Alert before warranty expires

## Photos
- One clear photo minimum for valuables
- Serial number visible if applicable
- Condition documentation for insurance
- Store in item folder or link from file

## Progressive Enhancement
- Week 1: catalog high-value items only
- Week 2: add electronics with warranties
- Month 2: room by room inventory
- Yearly: audit and update values

## Insurance Preparation
- Generate list of items over $X value
- Total replacement value calculation
- Photos and receipts organized
- Update after major purchases

## Moving Support
- Filter by room: what's in the bedroom?
- Box tracking: which box has what
- Unpacking checklist: verify arrival
- New location updates

## Decluttering Support
- Filter by last used date if tracked
- "Haven't used in 2 years" candidates
- Value check: worth selling?
- Donation tracking for tax purposes

## Serial Numbers and Receipts
- Serial numbers for electronics: theft recovery
- Receipt photos or PDFs linked
- Purchase confirmation emails saved
- AppleCare, extended warranties noted

## What To Surface
- "Warranty expires next month on dishwasher"
- "You have 3 HDMI cables in the office drawer"
- "Total electronics value: €X"
- "When did I buy the drill?" → instant answer

## Categories
- Electronics: computers, phones, TVs, audio
- Appliances: kitchen, laundry, climate
- Furniture: major pieces worth insuring
- Tools: power tools especially
- Valuables: jewelry, watches, art
- Collections: books, records, games
- Outdoor: bikes, sports equipment

## What NOT To Suggest
- Cataloging every small item — focus on valuable/losable
- Complex asset management software
- Obsessive organization — practical beats perfect
- Tracking consumables — that's shopping list territory

## Lending Tracking
- Item lent to whom, when
- Expected return date
- Reminder if not returned
- "Who has my drill?" → instant answer

## Maintenance Tracking
- Items needing regular maintenance
- Last serviced date
- Service schedule: HVAC filters, etc.
- Link to home maintenance if using that system

## Integration Points
- Home: maintenance schedules
- Receipts: purchase documentation
- Insurance: claims preparation
- Moving: box contents tracking
