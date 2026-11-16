const rates = [
    ['Saver dorm','Hostel dorm',1,290,450,'4.1',46,'Basic beds and a shared bathroom.'],
    ['Social hostel','Hostel dorm',1,430,650,'4.4',81,'Shared lounge and lockers for a student group.'],
    ['Twin guesthouse','Guesthouse',2,780,1100,'4.2',57,'An easy option for two people sharing.'],
    ['Private hostel room','Private hostel room',2,1050,1450,'4.3',63,'Hostel common areas with a private room.'],
    ['Budget hotel','Budget hotel',2,1450,1950,'4.2',72,'Private bathroom and space to unpack.'],
    ['Comfort hotel','Budget hotel',2,2100,2700,'4.5',96,'A quieter private room with more space.'],
]
const names = {jaipur:'Pink Courtyard',ahmedabad:'Sabarmati',hampi:'Boulder Trail'}
const ranges = {'under-800':[0,800],'800-1500':[800,1500],'1500-2500':[1500,2500]}
const money = value => '₹'+Number(value).toLocaleString('en-IN')
const formatRange = (low,high) => money(low)+'–'+Number(high).toLocaleString('en-IN')

export function lodgingFor(guide,trip) {
    const travelers=Math.max(1,Number(trip?.travelers)||1)
    const [minBudget,maxBudget]=ranges[trip?.budget] || [0,Infinity]
    const cityPremium=guide==='hampi'?80:guide==='jaipur'?50:0
    const stays=rates.map(([name,kind,capacity,baseLow,baseHigh,rating,reviews,note])=>{
        const low=baseLow+cityPremium, high=baseHigh+cityPremium
        const units=Math.ceil(travelers/(kind==='Hostel dorm' || trip?.sharing==='One private room each' ? 1 : capacity))
        const perPerson=Math.ceil(low*units/travelers)
        const preferredType=trip?.stayType===kind
        const preferredPriority=trip?.stayPriority==='Lowest cost' ? low : trip?.stayPriority==='Quiet and privacy' ? (kind==='Budget hotel'?0:1) : trip?.stayPriority==='Social common areas' ? (kind.includes('ostel')?0:1) : 0
        const target=Number.isFinite(maxBudget)?(minBudget+maxBudget)*.33:500
        return {title:names[guide]+' '+name,kind,rating,reviews,note,price:formatRange(low,high)+' per '+(capacity===1?'bed':'room')+' per night',
            estimate:formatRange(low*units,high*units)+' / night for '+travelers+' · '+units+' '+(capacity===1?(units===1?'bed':'beds'):(units===1?'room':'rooms')),
            higherSpend:perPerson>maxBudget*.65,
            score:(preferredType?0:5000)+(perPerson>maxBudget*.65?10000:0)+Math.abs(perPerson-target)+preferredPriority,
        }
    })
    return stays.sort((a,b)=>a.score-b.score).map((stay,index)=>({...stay,recommended:index===0 && !stay.higherSpend}))
}
