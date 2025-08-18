# %% 
from datetime import datetime
import swisseph as swe
# %% 
def julian_day(utc_dt: datetime) -> float:
    """Convert dt to UTC and return Julian day.

    Returns:
        float: The Julian day number
    """
    return swe.date_conversion(
        utc_dt.year,
        utc_dt.month,
        utc_dt.day,
        utc_dt.hour + utc_dt.minute / 60,
    )[1]
# %% 
def planet_positions(utc_dt: datetime, id: int) -> tuple[float, float]:
    """return the longitude and speed of the planet."""
    ((lon, _, _, speed, *_), _) = swe.calc_ut(julian_day(utc_dt), id)
    return lon, speed


# %% 
dt = datetime(1976, 4, 20, 18, 58)

bodies = {
    "SUN": 0,
    "MOON": 1,
    "MERCURY": 2,
    "VENUS": 3,
    "MARS": 4,
    "JUPITER": 5,
    "SATURN": 6,
    "URANUS": 7,
    "NEPTUNE": 8,
    "PLUTO": 9,
    "MEAN_NODE": 10,
}
# %% 
for key, value in bodies.items():
    lon, speed = planet_positions(dt, value)
    print(value, key, lon, speed)

# %%
def set_houses_vertices(julian_day: float, lat: float, lon: float, house_sys: str) -> None:
    """Calculate the cusps of the houses and set the vertices."""
    cusps, (asc_deg, mc_deg, *_) = swe.houses(
        julian_day,
        lat,
        lon,
        house_sys.encode(),
    )
    return cusps, asc_deg, mc_deg

# %% 
lat = 22.4
lon = 114.1

for hse in "PKORCEW":
    cusps, asc_deg, mc_deg = set_houses_vertices(julian_day(dt), lat, lon, hse)
    print(hse, cusps, asc_deg, mc_deg)


# %%
