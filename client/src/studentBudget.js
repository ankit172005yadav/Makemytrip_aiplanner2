const food = (id,title,price,rating,reviews,lat,lng,note) => ({
    id,title,price,rating,reviews,lat,lng,note,kind:'Food',mock:true,
})
export const budgetOptions = {
    jaipur: {
        stays: [{title:'Pink Courtyard Hostel',price:'₹450–750 per dorm bed',rating:'4.3',reviews:128}],
        transport: 'Walk between the old-city stops, split an auto to Amer, and compare fares before booking the hill-fort return.',
        meals:[
            [food('j1','Pink City Kachori Counter','₹40–100','4.5',146,26.9217,75.8235,'Quick breakfast or a snack between the old-city stops.'),food('j2','Johari Thali House','₹120–200','4.3',92,26.9218,75.8261,'An inexpensive sit-down lunch near the bazaar.')],
            [food('j3','Amer Fort Lunch Counter','₹100–180','4.2',74,26.9861,75.8526,'A simple lunch before returning to the city.')],
            [food('j4','Bapu Bazaar Chaat Stall','₹60–130','4.4',105,26.917,75.8239,'A quick snack before heading to Nahargarh.')],
        ],
    },
    ahmedabad: {
        stays: [{title:'Sabarmati Backpackers Dorm',price:'₹400–700 per dorm bed',rating:'4.4',reviews:101}],
        transport: 'Walk through the walled city, use buses or shared autos where practical, and split the longer ride to Adalaj.',
        meals:[
            [food('a1','Pol Lane Khaman Counter','₹35–90','4.6',183,23.029,72.5919,'A light breakfast before the heritage walk.'),food('a2','Manek Chowk Budget Bites','₹80–160','4.4',139,23.0229,72.5868,'Share a few plates to try more of the evening market.')],
            [food('a3','Riverfront Thali Room','₹120–200','4.3',86,23.0523,72.5816,'A simple lunch between the ashram and riverfront.')],
            [food('a4','Kankaria Snack Corner','₹50–120','4.2',67,23.007,72.5992,'A low-cost break near the lakefront.')],
        ],
    },
    hampi: {
        stays: [{title:'Boulder Trail Hostel',price:'₹500–850 per dorm bed',rating:'4.5',reviews:113}],
        transport: 'Walk within each group of ruins and split an auto between clusters. Carry a refillable water bottle for the exposed walks.',
        meals:[
            [food('h1','Bazaar Idli Corner','₹45–100','4.5',89,15.3356,76.462,'Breakfast near the bazaar before the temple walk.')],
            [food('h2','Kamalapura Meals House','₹100–180','4.4',94,15.3119,76.4739,'A filling lunch near the royal precincts.'),food('h3','Royal Road Tea Stall','₹25–65','4.2',41,15.3187,76.4739,'Tea and a small snack between monuments.')],
            [food('h4','Vittala Trail Snack Stop','₹50–130','4.3',56,15.3424,76.4765,'Pick up a snack and water before the riverside walk.')],
        ],
    },
}
