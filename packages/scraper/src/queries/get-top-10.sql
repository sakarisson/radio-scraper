WITH
  RankedPlays AS (
    SELECT
      RANK() OVER (
        ORDER BY
          COUNT(p.id) DESC
      ) AS rank,
      s.title,
      a.name AS artist,
      COUNT(p.id) AS play_count
    FROM
      plays p
      JOIN songs s ON p.song_id = s.id
      JOIN artists a ON s.artist_id = a.id
      JOIN stations st ON p.station_id = st.id
    WHERE
      st.slug = 'kvf'
      AND p.time_played BETWEEN datetime ('2024-08-01', 'utc') AND datetime  ('2024-09-01', 'utc')
    GROUP BY
      s.title,
      a.name
  )
SELECT
  *
FROM
  RankedPlays
WHERE
  rank <= 10
ORDER BY
  rank,
  play_count DESC;