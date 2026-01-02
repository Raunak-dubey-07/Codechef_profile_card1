// const express = require("express");
// const axios = require("axios");
// const cors = require("cors");
// const cheerio = require("cheerio");

// const app = express();
// app.use(cors());

// app.get("/profile/:username", async (req, res) => {
//   const { username } = req.params;

//   try {
//     const url = `https://www.codechef.com/users/${username}`;
//     const { data: html } = await axios.get(url, {
//       headers: {
//         "User-Agent": "Mozilla/5.0"
//       }
//     });

//     const $ = cheerio.load(html);

//     /* -------------------- NAME (DISPLAY NAME) -------------------- */
//     let name = null;

//     // Most common (new layout)
//     const h1Name = $(".user-details h1").first().text().trim();
//     if (h1Name) name = h1Name;

//     // Fallback 1
//     if (!name) {
//       const altName = $("h1").first().text().trim();
//       if (altName && altName !== username) {
//         name = altName;
//       }
//     }

//     // Final fallback → username
//     if (!name) {
//       name = username;
//     }

//     /* -------------------- COUNTRY & FLAG -------------------- */
//     const country =
//       $(".user-country-name").first().text().trim() || "N/A";

//     const countryFlag =
//       $(".user-country-flag").attr("src") || null;

//     /* -------------------- RATINGS -------------------- */
//     const currentRating =
//       $(".rating-number").first().text().trim() || null;

//     let highestRating = null;
//     const highestText = $("small")
//       .filter((_, el) => $(el).text().includes("Highest Rating"))
//       .text();

//     if (highestText) {
//       const match = highestText.match(/(\d+)/);
//       highestRating = match ? match[1] : null;
//     }

//     /* -------------------- STARS -------------------- */
//     let stars = null;
//     const starCount = $(".rating-star span").length;
//     if (starCount > 0) {
//       stars = `${starCount}★`;
//     }

//     /* -------------------- RANKS -------------------- */
//     let globalRank = null;
//     let countryRank = null;

//     $("a").each((_, el) => {
//       const href = $(el).attr("href");
//       const rank = $(el).find("strong").text().trim();

//       if (href === "/ratings/all" && rank) {
//         globalRank = rank;
//       }

//       if (
//         href &&
//         href.includes("/ratings/all?filterBy=Country") &&
//         rank
//       ) {
//         countryRank = rank;
//       }
//     });

//     /* -------------------- AVATAR -------------------- */
//     const avatar =
//       $(".profileImage").attr("src") || null;

//     /* -------------------- LAST 3 CONTESTS -------------------- */
//     let lastContests = [];
//     const ratingArrayMatch = html.match(/var all_rating = (\[.*?\]);/s);

//     if (ratingArrayMatch && ratingArrayMatch[1]) {
//       const allRating = JSON.parse(ratingArrayMatch[1]);
//       const lastThree = allRating.slice(-3);

//       lastContests = lastThree.map(c => ({
//         name: c.name,
//         rating: c.rating,
//         rank: c.rank,
//         date: c.end_date,
//         code: c.code
//       }));
//     }

//     /* -------------------- RESPONSE -------------------- */
//     res.json({
//       username,
//       name,                // 👈 DISPLAY NAME (FIXED)
//       country,
//       countryFlag,
//       stars,
//       currentRating,
//       highestRating,
//       countryRank,
//       globalRank,
//       avatar,
//       lastContests
//     });

//   } catch (error) {
//     console.error(error.message);
//     res.status(500).json({ error: "Failed to fetch profile" });
//   }
// });

// const PORT = process.env.PORT || 3000;

// if (process.env.VERCEL) {
//   module.exports = app; // Vercel
// } else {
//   app.listen(PORT, () => {
//     console.log(`Server running at http://localhost:${PORT}`);
//   });
// }



const express = require("express");
const axios = require("axios");
const cors = require("cors");
const cheerio = require("cheerio");

const app = express();
app.use(cors());

app.get("/profile/:username", async (req, res) => {
  const { username } = req.params;

  try {
    const url = `https://www.codechef.com/users/${username}`;
    const { data: html } = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    });

    const $ = cheerio.load(html);

    // ---------- NAME ----------
    let name =
      $(".user-details h1").text().trim() ||
      $("h1").first().text().trim() ||
      username;

    if (!name || name === username) name = username;

    // ---------- COUNTRY ----------
    const country = $(".user-country-name").text().trim() || "N/A";
    const countryFlag = $(".user-country-flag").attr("src") || null;

    // ---------- STARS ----------
    let stars = null;
    const starCount = $(".rating-star span").length;
    if (starCount > 0) stars = `${starCount}★`;

    // ---------- RATINGS ----------
    const currentRating =
      $(".rating-number").first().text().trim() || null;

    const highestRatingMatch = html.match(
      /\(Highest Rating (\d+)\)/
    );
    const highestRating = highestRatingMatch
      ? highestRatingMatch[1]
      : null;

    // ---------- RANKS ----------
    const ranks = $(".rating-ranks strong");
    const globalRank = ranks.eq(0).text().trim() || null;
    const countryRank = ranks.eq(1).text().trim() || null;

    // ---------- AVATAR ----------
    const avatar =
      $(".profileImage").attr("src") ||
      $("img[src*='avatar']").attr("src") ||
      null;

    // ---------- LAST 3 CONTESTS ----------
    let lastContests = [];
    const ratingMatch = html.match(/var all_rating = (\[.*?\]);/s);

    if (ratingMatch) {
      const allRatings = JSON.parse(ratingMatch[1]);
      lastContests = allRatings.slice(-3).map(c => ({
        name: c.name,
        rating: c.rating,
        rank: c.rank,
        date: c.end_date,
        code: c.code
      }));
    }

    res.json({
      username,
      name,
      country,
      countryFlag,
      stars,
      currentRating,
      highestRating,
      countryRank,
      globalRank,
      avatar,
      lastContests
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Profile fetch failed" });
  }
});

// 🚨 IMPORTANT FOR VERCEL
module.exports = app;
