// /api/james.js
// Vercel serverless function — backend for James, the Riverside & Crown property assistant.
// Holds the Anthropic API key safely server-side and proxies chat requests from the HTML widget.

const PROPERTIES = [
  {id:"TW-S-1001",type:"sale",address:"Strawberry Vale, Strawberry Hill",postcode:"TW1 4RX",area:"Strawberry Hill",price:2250000,style:"Semi-detached period house",beds:5,baths:2,receptions:3,garden:true,parking:"Off-street parking",desc:"An exceptional semi-detached family home with a garden backing directly onto the River Thames and private mooring for two boats. Set across three floors with a wrap-around kitchen.",features:["Riverside garden","Private mooring","Three floors"],station:"Strawberry Hill",commute:28,slots:["Wed 18 Jun, 10:00am with Charlotte","Thu 19 Jun, 2:30pm with Adam","Fri 20 Jun, 11:00am with Robert","Sat 21 Jun, 9:30am with Charlotte"]},
  {id:"TW-S-1002",type:"sale",address:"Beaconsfield Road, St Margarets",postcode:"TW1 3HU",area:"St Margarets",price:1950000,style:"Detached period house",beds:5,baths:3,receptions:2,garden:true,parking:"Driveway",desc:"A family home blending original character with modern comfort — intricate cornices and elegant fireplaces alongside contemporary finishes throughout.",features:["Period features","Modern kitchen","Walk to station"],station:"St Margarets",commute:24,slots:["Wed 18 Jun, 1:00pm with Robert","Thu 19 Jun, 4:00pm with Adam","Fri 20 Jun, 5:30pm with Charlotte","Sat 21 Jun, 10:30am with Robert"]},
  {id:"TW-S-1003",type:"sale",address:"Clive Road, Strawberry Hill",postcode:"TW1 4SQ",area:"Strawberry Hill",price:1750000,style:"Detached house",beds:5,baths:4,receptions:2,garden:true,parking:"Off-street parking",desc:"A fully updated five bedroom detached house with a bright, modern open-plan kitchen, dining and sitting area, finished to a high standard throughout.",features:["Fully renovated","Open-plan living","Four bathrooms"],station:"Strawberry Hill",commute:28,slots:["Wed 18 Jun, 4:00pm with Adam","Fri 20 Jun, 9:30am with Charlotte","Fri 20 Jun, 3:00pm with Robert"]},
  {id:"TW-S-1004",type:"sale",address:"Egerton Road, Twickenham Square",postcode:"TW2 7SL",area:"Twickenham",price:1405000,style:"New-build townhouse",beds:3,baths:2,receptions:1,garden:false,parking:"Allocated space",desc:"A three bedroom townhouse at Twickenham Square, nestled among landscaped gardens, with underfloor heating and a fitted kitchen throughout.",features:["Brand new build","Underfloor heating","Communal gardens"],station:"Twickenham",commute:30,slots:["Wed 18 Jun, 11:00am with Charlotte","Thu 19 Jun, 2:00pm with Robert","Sat 21 Jun, 11:30am with Adam","Mon 22 Jun, 10:00am with Charlotte"]},
  {id:"TW-S-1005",type:"sale",address:"Heathfield North",postcode:"TW2 7QN",area:"Twickenham",price:1300000,style:"Semi-detached period house",beds:3,baths:2,receptions:2,garden:true,parking:"On-street",desc:"A magnificent three bedroom semi-detached period home, entirely renovated to the highest standard, with two formal reception rooms and an open-plan kitchen/diner.",features:["Entirely renovated","No onward chain"],station:"Twickenham",commute:30,slots:["Thu 19 Jun, 9:00am with Robert","Fri 20 Jun, 1:30pm with Adam","Sat 21 Jun, 1:30pm with Charlotte"]},
  {id:"TW-S-1006",type:"sale",address:"Mallard Place, Strawberry Hill",postcode:"TW1 4SR",area:"Strawberry Hill",price:1295000,style:"Riverside townhouse",beds:3,baths:3,receptions:1,garden:false,parking:"Off-street parking",desc:"A three bedroom mid-terrace townhouse directly overlooking the River Thames, flooded with natural light and thoughtfully designed throughout.",features:["Direct river views","Three bathrooms"],station:"Strawberry Hill",commute:28,slots:["Wed 18 Jun, 3:30pm with Charlotte","Thu 19 Jun, 6:00pm with Robert","Fri 20 Jun, 10:00am with Adam"]},
  {id:"TW-S-1007",type:"sale",address:"Richmond Bridge Estate",postcode:"TW1 3DU",area:"East Twickenham",price:1700000,style:"Ground floor apartment",beds:3,baths:2,receptions:1,garden:false,parking:"Allocated",desc:"Three double bedroom ground floor apartment with a private terrace, positioned over the communal gardens, water feature and the River Thames.",features:["Private terrace","River views","Gated estate"],station:"Richmond",commute:20,slots:["Thu 19 Jun, 11:30am with Adam","Fri 20 Jun, 4:00pm with Charlotte","Sat 21 Jun, 3:00pm with Robert"]},
  {id:"RD-S-2001",type:"sale",address:"Sheen Road area",postcode:"TW9 1AD",area:"Richmond",price:895000,style:"Period conversion flat",beds:2,baths:1,receptions:1,garden:false,parking:"On-street permit",desc:"A well-presented two double bedroom first floor conversion flat moments from Richmond town centre, with high ceilings and period detailing throughout.",features:["Walk to Richmond station","Period detailing"],station:"Richmond",commute:19,slots:["Wed 18 Jun, 10:00am with Robert","Thu 19 Jun, 5:00pm with Charlotte","Fri 20 Jun, 1:00pm with Adam"]},
  {id:"TW-L-3001",type:"let",address:"Cole Park Road",postcode:"TW1 1HX",area:"Twickenham",price:2800,pcm:true,style:"Victorian terraced house",beds:3,baths:2,receptions:2,garden:true,parking:"On-street",desc:"A beautifully presented three bedroom Victorian terraced house close to Twickenham town centre, with a private rear garden and two reception rooms.",features:["Private garden","Walk to station"],station:"Twickenham",commute:30,slots:["Wed 18 Jun, 5:00pm with Adam","Thu 19 Jun, 5:30pm with Charlotte","Fri 20 Jun, 4:00pm with Robert","Sat 21 Jun, 12:30pm with Adam"]},
  {id:"TW-L-3002",type:"let",address:"Egerton Road, Twickenham Square",postcode:"TW2 7SL",area:"Twickenham",price:2400,pcm:true,style:"New-build apartment",beds:2,baths:2,receptions:1,garden:false,parking:"Allocated",desc:"A modern two bedroom apartment at Twickenham Square with underfloor heating, fitted kitchen, and access to landscaped communal gardens.",features:["Brand new","Concierge available"],station:"Twickenham",commute:30,slots:["Thu 19 Jun, 12:00pm with Robert","Fri 20 Jun, 6:00pm with Adam","Sat 21 Jun, 11:00am with Charlotte"]},
  {id:"RD-L-4001",type:"let",address:"Richmond Riverside",postcode:"TW9 1HX",area:"Richmond",price:3200,pcm:true,style:"Riverside apartment",beds:2,baths:2,receptions:1,garden:false,parking:"None",desc:"A two double bedroom apartment with direct views over the River Thames, moments from Richmond town centre and station, available immediately.",features:["River views","Available immediately"],station:"Richmond",commute:19,slots:["Wed 18 Jun, 6:00pm with Charlotte","Thu 19 Jun, 7:00pm with Robert","Fri 20 Jun, 5:00pm with Adam"]},
  {id:"SH-S-5001",type:"sale",address:"East Sheen, near Sheen Lane",postcode:"SW14 8AB",area:"East Sheen",price:1150000,style:"Edwardian terraced house",beds:3,baths:1,receptions:2,garden:true,parking:"On-street permit",desc:"A charming three bedroom Edwardian terrace close to East Sheen's village high street, with a south-facing rear garden and two reception rooms.",features:["South-facing garden","Period features"],station:"Mortlake",commute:27,slots:["Thu 19 Jun, 10:30am with Adam","Fri 20 Jun, 2:00pm with Robert","Sat 21 Jun, 9:00am with Charlotte"]},
  {id:"TD-S-6001",type:"sale",address:"Teddington, near Broad Street",postcode:"TW11 8QZ",area:"Teddington",price:975000,style:"Semi-detached house",beds:3,baths:2,receptions:1,garden:true,parking:"Driveway",desc:"A well-proportioned three bedroom semi-detached family home close to Teddington High Street and the river, with off-street parking and a private garden.",features:["Driveway parking","Close to high street"],station:"Teddington",commute:35,slots:["Wed 18 Jun, 12:30pm with Robert","Fri 20 Jun, 6:30pm with Charlotte","Sat 21 Jun, 9:30am with Adam"]},
  {id:"TW-S-1008",type:"sale",address:"Heath Road, Twickenham",postcode:"TW1 4AY",area:"Twickenham",price:425000,style:"Studio apartment",beds:0,baths:1,receptions:1,garden:false,parking:"None",desc:"A bright studio apartment moments from Twickenham town centre, ideal for a first-time buyer or investor, with a modern kitchenette and bathroom.",features:["First-time buyer ideal","Walk to station","Low service charge"],station:"Twickenham",commute:30,slots:["Wed 18 Jun, 9:30am with Charlotte","Thu 19 Jun, 1:00pm with Adam","Sat 21 Jun, 10:00am with Robert"]},
  {id:"KEW-S-7001",type:"sale",address:"Mortlake Terrace, Kew",postcode:"TW9 3DT",area:"Kew",price:1595000,style:"Detached period house",beds:4,baths:3,receptions:2,garden:true,parking:"Driveway",desc:"An elegant four bedroom detached house close to Kew Gardens, with a beautifully landscaped garden and a recently extended kitchen-diner.",features:["Near Kew Gardens","Extended kitchen","Landscaped garden"],station:"Kew Gardens",commute:22,slots:["Thu 19 Jun, 10:00am with Robert","Fri 20 Jun, 12:00pm with Adam","Sat 21 Jun, 2:30pm with Charlotte"]},
  {id:"KEW-L-7002",type:"let",address:"Kew Road",postcode:"TW9 2NA",area:"Kew",price:2100,pcm:true,style:"One bedroom apartment",beds:1,baths:1,receptions:1,garden:false,parking:"None",desc:"A smartly presented one bedroom apartment close to Kew Gardens station, with a private balcony and modern fitted kitchen.",features:["Private balcony","Walk to station","Available now"],station:"Kew Gardens",commute:22,slots:["Wed 18 Jun, 4:30pm with Charlotte","Thu 19 Jun, 6:30pm with Robert","Sat 21 Jun, 12:00pm with Adam"]},
  {id:"WHIT-S-8001",type:"sale",address:"Percy Road, Whitton",postcode:"TW2 6JS",area:"Whitton",price:625000,style:"Terraced house",beds:2,baths:1,receptions:1,garden:true,parking:"On-street",desc:"A neat two bedroom terraced house in Whitton, recently redecorated throughout, with a low-maintenance rear garden and close to local schools.",features:["Recently redecorated","Close to schools","Low-maintenance garden"],station:"Whitton",commute:33,slots:["Wed 18 Jun, 2:00pm with Adam","Fri 20 Jun, 11:30am with Charlotte","Sat 21 Jun, 3:30pm with Robert"]},
  {id:"WHIT-L-8002",type:"let",address:"Constance Road, Whitton",postcode:"TW2 7JF",area:"Whitton",price:1850,pcm:true,style:"Two bedroom flat",beds:2,baths:1,receptions:1,garden:false,parking:"On-street",desc:"A well-proportioned two bedroom first floor flat in a quiet residential road, offered unfurnished and available from early July.",features:["Quiet residential road","Available July","Unfurnished"],station:"Whitton",commute:33,slots:["Thu 19 Jun, 6:00pm with Robert","Fri 20 Jun, 7:00pm with Adam","Sat 21 Jun, 10:00am with Charlotte"]},
  {id:"ETW-S-9001",type:"sale",address:"Cambridge Park, East Twickenham",postcode:"TW1 2PE",area:"East Twickenham",price:2950000,style:"Detached riverside house",beds:6,baths:4,receptions:3,garden:true,parking:"Gated driveway",desc:"A substantial six bedroom detached house in the prestigious Cambridge Park conservation area, with a gated driveway and far-reaching garden views.",features:["Conservation area","Gated driveway","Six bedrooms"],station:"St Margarets",commute:24,slots:["Fri 20 Jun, 9:00am with Charlotte","Sat 21 Jun, 1:00pm with Robert","Mon 22 Jun, 11:00am with Adam"]},
  {id:"ETW-L-9002",type:"let",address:"Cambridge Road, East Twickenham",postcode:"TW1 2PA",area:"East Twickenham",price:1750,pcm:true,style:"Studio apartment",beds:0,baths:1,receptions:1,garden:false,parking:"None",desc:"A compact, well-presented studio apartment close to Richmond Bridge, perfect for a single professional, available furnished or unfurnished.",features:["Furnished or unfurnished","Close to Richmond Bridge"],station:"Richmond",commute:20,slots:["Wed 18 Jun, 7:00pm with Robert","Thu 19 Jun, 6:30pm with Adam","Sat 21 Jun, 4:00pm with Charlotte"]},
  {id:"RD-S-2002",type:"sale",address:"The Vineyard, Richmond",postcode:"TW10 6AN",area:"Richmond",price:3450000,style:"Georgian townhouse",beds:5,baths:3,receptions:3,garden:true,parking:"Off-street parking",desc:"A handsome Georgian townhouse on one of Richmond Hill's most sought-after roads, with high ceilings, sash windows and a walled garden.",features:["Georgian architecture","Walled garden","Richmond Hill location"],station:"Richmond",commute:19,slots:["Thu 19 Jun, 3:00pm with Adam","Fri 20 Jun, 10:30am with Charlotte","Sat 21 Jun, 2:00pm with Robert"]},
  {id:"SH-L-5002",type:"let",address:"Sheen Lane, East Sheen",postcode:"SW14 8LP",area:"East Sheen",price:2950,pcm:true,style:"Three bedroom house",beds:3,baths:2,receptions:2,garden:true,parking:"On-street permit",desc:"A family-friendly three bedroom house moments from East Sheen's village shops, with a sunny garden and close to well-regarded local schools.",features:["Close to schools","Sunny garden","Village location"],station:"Mortlake",commute:27,slots:["Wed 18 Jun, 4:30pm with Robert","Fri 20 Jun, 4:30pm with Charlotte","Sat 21 Jun, 1:00pm with Adam"]},
  {id:"TD-L-6002",type:"let",address:"Stanley Road, Teddington",postcode:"TW11 8TW",area:"Teddington",price:2200,pcm:true,style:"Two bedroom maisonette",beds:2,baths:1,receptions:1,garden:true,parking:"On-street",desc:"A bright two bedroom maisonette over two floors close to Teddington Lock, with its own private entrance and a small rear courtyard garden.",features:["Private entrance","Courtyard garden","Near Teddington Lock"],station:"Teddington",commute:35,slots:["Thu 19 Jun, 5:30pm with Adam","Fri 20 Jun, 6:00pm with Robert","Sat 21 Jun, 11:00am with Charlotte"]},
  {id:"STM-S-1009",type:"sale",address:"Crown Road, St Margarets",postcode:"TW1 3EE",area:"St Margarets",price:1095000,style:"Maisonette conversion",beds:2,baths:2,receptions:1,garden:false,parking:"On-street permit",desc:"A stylish two bedroom upper maisonette in a converted Victorian villa, with a private roof terrace and a short walk to St Margarets station.",features:["Private roof terrace","Victorian conversion","Walk to station"],station:"St Margarets",commute:24,slots:["Wed 18 Jun, 3:00pm with Charlotte","Thu 19 Jun, 11:00am with Robert","Sat 21 Jun, 10:30am with Adam"]},
  {id:"RD-L-4002",type:"let",address:"Friars Stile Road, Richmond",postcode:"TW10 6NQ",area:"Richmond",price:5500,pcm:true,style:"Detached house",beds:4,baths:3,receptions:2,garden:true,parking:"Off-street parking",desc:"A substantial detached family house close to Richmond Park, offered furnished or unfurnished, with a large private garden ideal for entertaining.",features:["Close to Richmond Park","Large private garden","Furnished or unfurnished"],station:"Richmond",commute:19,slots:["Thu 19 Jun, 4:30pm with Charlotte","Fri 20 Jun, 2:30pm with Robert","Mon 22 Jun, 12:00pm with Adam"]},
  {id:"SH-S-5002",type:"sale",address:"Clarence Lane, East Sheen",postcode:"SW14 8PE",area:"East Sheen",price:1875000,style:"New-build detached house",beds:5,baths:4,receptions:2,garden:true,parking:"Double garage",desc:"A striking new-build detached house finished to an exceptional specification, with a double garage, landscaped garden and bi-fold doors onto the patio.",features:["Brand new","Double garage","Bi-fold doors"],station:"Mortlake",commute:27,slots:["Fri 20 Jun, 1:00pm with Adam","Sat 21 Jun, 3:30pm with Charlotte","Mon 22 Jun, 9:30am with Robert"]}
];

const SYSTEM_PROMPT_TEMPLATE = `You are James, the digital property assistant for Riverside & Crown, an estate agency covering Twickenham, St Margarets, Strawberry Hill, East Twickenham, Richmond, East Sheen, Teddington, Kew and Whitton (London). If asked your name, you are James. Refer to yourself as James only when it's natural (e.g. signing off, or if asked) — don't repeat your name in every message.

Your job, in order, is to:
1. Qualify the visitor: are they buying or renting, how many bedrooms minimum, which area, any preference on parking/property style.
2. Once you have enough to search (interest_type is the minimum required; ask for the others naturally across 1-3 short messages, don't interrogate), recommend matching properties from the AVAILABLE PROPERTIES list below by setting action "show_properties" with the matching listing_ids.
3. When the visitor wants to book a viewing for a specific property, set listing_of_interest, then collect name, phone, and email (one at a time, naturally, only ask for what's missing).
4. Once you have name + phone + email + a chosen property, show that property's available viewing slots using action "show_slots".
5. When the visitor picks a slot (or asks to change a previously picked slot — THIS MUST WORK AT ANY TIME, even after a booking was already made), set action "confirm_booking" with the new slot. If a booking already exists and they're changing it, still use "confirm_booking" — this updates the existing record rather than creating a new one. Each slot string already includes which agent (Adam, Charlotte, or Robert) will conduct that viewing — when confirming, mention the agent by name. Be flexible: if none of the listed slots suit the visitor, offer the closest alternatives or suggest a human agent will follow up — don't refuse or get stuck.
6. You can also handle: general questions about a property, switching to a different property, correcting contact details, restarting the search with new criteria. Always use the CURRENT_LEAD_STATE given to you as the source of truth for what's already known.

Tone: warm, concise, professional UK estate agency register. Sentence case. No emoji. Keep replies short (1-3 sentences) unless listing properties.

AVAILABLE PROPERTIES (JSON):
__PROPERTIES_JSON__

You MUST respond with ONLY a JSON object (no markdown fences, no preamble), matching exactly this shape:
{
  "reply": "string, your natural language message to show the visitor",
  "action": "none | show_properties | show_slots | confirm_booking",
  "listing_ids": ["array of listing_id strings, only if action is show_properties"],
  "listing_of_interest": "listing_id string or null",
  "slots_for_listing": "listing_id string or null, only if action is show_slots",
  "chosen_slot": "string or null, only if action is confirm_booking",
  "lead_update": {
    "interest_type": "sale | let | null",
    "beds_min": "number or null",
    "areas": ["array of area name strings, or empty array"],
    "parking": "string or null",
    "name": "string or null",
    "phone": "string or null",
    "email": "string or null"
  }
}
Only include non-null fields you are setting or changing in lead_update — but always include the full lead_update object with whatever you know cumulatively.`;

module.exports = async function handler(req, res) {
  // CORS — allow the widget (hosted anywhere) to call this endpoint
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userText, conversationHistory = [], leadState = {}, crmRecords = [] } = req.body;

    const stateSummary = {
      current_lead_state: leadState,
      has_active_booking: !!(crmRecords.length && crmRecords[crmRecords.length - 1].status !== 'changed_pending'),
      last_booking: crmRecords.length ? crmRecords[crmRecords.length - 1] : null
    };

    const newUserMessage = {
      role: 'user',
      content: userText + '\n\n[CURRENT_LEAD_STATE: ' + JSON.stringify(stateSummary) + ']'
    };

    const messages = [...conversationHistory, newUserMessage];

    const propertiesForPrompt = PROPERTIES.map(function (p) {
      return {
        id: p.id, type: p.type, address: p.address, area: p.area, price: p.price,
        pcm: !!p.pcm, style: p.style, beds: p.beds, baths: p.baths, parking: p.parking, slots: p.slots
      };
    });

    const systemPrompt = SYSTEM_PROMPT_TEMPLATE.replace('__PROPERTIES_JSON__', JSON.stringify(propertiesForPrompt));

    const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        system: systemPrompt,
        messages: messages
      })
    });

    if (!anthropicResponse.ok) {
      const errText = await anthropicResponse.text();
      console.error('Anthropic API error:', anthropicResponse.status, errText);
      return res.status(502).json({
        reply: "Sorry — I'm having trouble connecting just now. Could you try again in a moment?",
        action: 'none',
        lead_update: {}
      });
    }

    const data = await anthropicResponse.json();
    const raw = (data.content || []).map(function (b) { return b.text || ''; }).join('').trim();

    let parsed;
    try {
      const clean = raw.replace(/```json|```/g, '').trim();
      parsed = JSON.parse(clean);
    } catch (e) {
      console.error('Failed to parse Claude response as JSON:', raw);
      parsed = { reply: "Sorry, could you say that again?", action: 'none', lead_update: {} };
    }

    return res.status(200).json(parsed);
  } catch (err) {
    console.error('Handler error:', err);
    return res.status(500).json({
      reply: "Sorry — something went wrong on our end. Please try again shortly.",
      action: 'none',
      lead_update: {}
    });
  }
};
