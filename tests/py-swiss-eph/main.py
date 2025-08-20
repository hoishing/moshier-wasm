#!/usr/bin/env python3
"""
Swiss Ephemeris Python implementation with JSON input/output
Matches the optimized web worker schema format
"""
import json
import sys
from datetime import datetime
from typing import Dict, List, Any
import swisseph as swe


def load_input(file_path: str) -> Dict[str, Any]:
    """Load and parse JSON input file."""
    try:
        with open(file_path, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"Error: Input file '{file_path}' not found", file=sys.stderr)
        sys.exit(1)
    except json.JSONDecodeError as e:
        print(f"Error: Invalid JSON in '{file_path}': {e}", file=sys.stderr)
        sys.exit(1)


def julian_day(year: int, month: int, day: int, hour: int, minute: int) -> float:
    """Convert date/time to Julian day number."""
    time_decimal = hour + minute / 60.0
    return swe.date_conversion(year, month, day, time_decimal)[1]


def get_planet_positions(jd_ut: float) -> List[Dict[str, Any]]:
    """Calculate positions for all planets and return in schema format."""
    # Planet mapping with lowercase names
    planets_map = {
        0: "sun",
        1: "moon", 
        2: "mercury",
        3: "venus",
        4: "mars",
        5: "jupiter",
        6: "saturn",
        7: "uranus",
        8: "neptune",
        9: "pluto",
        10: "mean node"
    }
    
    planets = []
    
    for planet_id, name in planets_map.items():
        try:
            # Calculate planet position and speed
            result, _ = swe.calc_ut(jd_ut, planet_id)
            longitude = result[0]
            speed = result[3]
            
            # Determine if retrograde (speed < 0)
            is_retro = speed < 0.0
            
            planets.append({
                "name": name,
                "long": longitude,
                "retro": is_retro
            })
            
        except Exception as e:
            print(f"Error calculating {name}: {e}", file=sys.stderr)
            continue
    
    return planets


def get_houses_and_angles(jd_ut: float, latitude: float, longitude: float, house_system: str) -> tuple:
    """Calculate house cusps and angles."""
    try:
        # Convert house system to bytes as required by swisseph
        house_sys_byte = house_system.encode('utf-8')
        
        # Calculate houses and angles
        cusps, ascmc = swe.houses(jd_ut, latitude, longitude, house_sys_byte)
        
        # Extract ascendant and midheaven
        asc = ascmc[0]  # Ascendant
        mc = ascmc[1]   # Midheaven (MC)
        
        # Convert cusps to list (houses 1-12)
        houses = list(cusps[1:13])  # cusps[0] is unused, cusps[1-12] are houses 1-12
        
        return asc, mc, houses
        
    except Exception as e:
        print(f"Error calculating houses: {e}", file=sys.stderr)
        return 0.0, 0.0, [0.0] * 12


def calculate_chart(input_data: Dict[str, Any]) -> Dict[str, Any]:
    """Main calculation function returning schema-compliant JSON."""
    # Extract input parameters
    year = input_data["year"]
    month = input_data["month"] 
    day = input_data["day"]
    hour = input_data["hour"]
    minute = input_data["minute"]
    latitude = input_data["latitude"]
    longitude = input_data["longitude"]
    house_system = input_data.get("house", "P")  # Default to Placidus
    
    # Calculate Julian day
    jd_ut = julian_day(year, month, day, hour, minute)
    
    # Calculate planetary positions
    planets = get_planet_positions(jd_ut)
    
    # Calculate houses and angles
    asc, mc, houses = get_houses_and_angles(jd_ut, latitude, longitude, house_system)
    
    # Return result in optimized schema format
    return {
        "jd_ut": jd_ut,
        "planets": planets,
        "asc": asc,
        "mc": mc,
        "houses": houses
    }


def main():
    """CLI interface."""
    if len(sys.argv) != 2:
        print("Usage: python main.py <input.json>", file=sys.stderr)
        print("Example: python main.py ../input_data.json", file=sys.stderr)
        sys.exit(1)
    
    input_file = sys.argv[1]
    
    # Load input data
    input_data = load_input(input_file)
    
    # Calculate chart
    result = calculate_chart(input_data)
    
    # Output JSON result
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()