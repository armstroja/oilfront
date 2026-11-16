/* Load FIRST. Replaces Math.random with a seeded generator so the same ?seed=N gives the same map and town names. */
(()=>{const q=new URLSearchParams(location.search).get('seed');window.GAME_SEED=q?(+q|0):(Math.random()*1e9|0);let s=GAME_SEED;
 Math.random=()=>{s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}})();
