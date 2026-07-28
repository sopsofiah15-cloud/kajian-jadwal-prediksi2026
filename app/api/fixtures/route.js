import { NextResponse } from "next/server";

const MONTHS_ID = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

function formatDateID(dateStr) {
  // dateStr format: YYYY-MM-DD
  const [y, m, d] = dateStr.split("-").map(Number);
  return `${d} ${MONTHS_ID[m - 1]} ${y}`;
}

function getDateRange(from, to) {
  const dates = [];
  let cur = new Date(`${from}T00:00:00Z`);
  const end = new Date(`${to}T00:00:00Z`);
  while (cur <= end) {
    dates.push(cur.toISOString().slice(0, 10));
    cur.setUTCDate(cur.getUTCDate() + 1);
  }
  return dates;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to") || from;

  if (!from) {
    return NextResponse.json(
      { error: 'Parameter "from" wajib diisi (format YYYY-MM-DD)' },
      { status: 400 }
    );
  }

  const apiKey = process.env.API_FOOTBALL_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "API_FOOTBALL_KEY belum diset di environment variables" },
      { status: 500 }
    );
  }

  const dates = getDateRange(from, to);
  let allFixtures = [];

  try {
    for (const date of dates) {
      const res = await fetch(
        `https://v3.football.api-sports.io/fixtures?date=${date}&timezone=Asia/Jakarta`,
        {
          headers: { "x-apisports-key": apiKey },
          cache: "no-store",
        }
      );

      if (!res.ok) {
        throw new Error(`API-Football error ${res.status} untuk tanggal ${date}`);
      }

      const data = await res.json();
      if (data.response) {
        allFixtures = allFixtures.concat(data.response);
      }
    }
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 502 });
  }

  // Kelompokkan per liga
  const leagues = new Map();
  for (const fx of allFixtures) {
    const leagueKey = `${fx.league.name} (${fx.league.country})`;
    if (!leagues.has(leagueKey)) leagues.set(leagueKey, []);
    leagues.get(leagueKey).push(fx);
  }

  // Urutkan pertandingan dalam tiap liga berdasarkan jam kickoff
  for (const matches of leagues.values()) {
    matches.sort((a, b) => new Date(a.fixture.date) - new Date(b.fixture.date));
  }

  // Urutkan liga berdasarkan pertandingan paling awal
  const sortedLeagues = [...leagues.entries()].sort((a, b) => {
    const aTime = new Date(a[1][0].fixture.date);
    const bTime = new Date(b[1][0].fixture.date);
    return aTime - bTime;
  });

  // Susun teks output
  const lines = [];
  for (const [leagueName, matches] of sortedLeagues) {
    lines.push(leagueName.toUpperCase());
    let lastDate = null;

    for (const fx of matches) {
      // fx.fixture.date sudah dalam format ISO dengan offset Asia/Jakarta,
      // contoh: "2026-07-29T02:00:00+07:00" -> ambil langsung tanpa konversi ulang
      const isoStr = fx.fixture.date;
      const localDatePart = isoStr.slice(0, 10);
      const localTimePart = isoStr.slice(11, 16);

      if (localDatePart !== lastDate) {
        lines.push(`${formatDateID(localDatePart)} (WIB)`);
        lastDate = localDatePart;
      }

      lines.push(`${localTimePart} – ${fx.teams.home.name} vs ${fx.teams.away.name}`);
    }

    lines.push("");
  }

  const formattedText = lines.join("\n").trim();

  return NextResponse.json({
    formattedText,
    count: allFixtures.length,
    raw: allFixtures.map((fx) => ({
      league: fx.league.name,
      country: fx.league.country,
      date: fx.fixture.date,
      status: fx.fixture.status.short,
      home: fx.teams.home.name,
      away: fx.teams.away.name,
    })),
  });
}
