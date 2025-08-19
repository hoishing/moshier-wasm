/**
 * @preserve Copyright (c) 2018-2022 NN Solex, www.sublunar.space
 * License MIT: http://www.opensource.org/licenses/MIT
 */

/**
 * @brief Modified by u-blusky Swep-Wasm
 *
 */

#define ONLINE 1
#define OFFLINE 2

#ifndef USECASE
#endif

#include <stdlib.h>
#include <stdio.h>
#include <time.h>
#include <math.h>
#include <ctype.h>
#include "swephexp.h"

#if USECASE == OFFLINE
#include <emscripten.h>
#endif

// Removed unused DMS and zodiac constants

// Function to convert planet name to lowercase
static void to_lowercase(char *str) {
  for (int i = 0; str[i]; i++) {
    str[i] = tolower(str[i]);
  }
}

// Special handling for planet names
static void get_planet_name_lower(int planet_id, char *name) {
  switch(planet_id) {
    case 0: strcpy(name, "sun"); break;
    case 1: strcpy(name, "moon"); break;
    case 2: strcpy(name, "mercury"); break;
    case 3: strcpy(name, "venus"); break;
    case 4: strcpy(name, "mars"); break;
    case 5: strcpy(name, "jupiter"); break;
    case 6: strcpy(name, "saturn"); break;
    case 7: strcpy(name, "uranus"); break;
    case 8: strcpy(name, "neptune"); break;
    case 9: strcpy(name, "pluto"); break;
    case 10: strcpy(name, "mean node"); break;
    default: 
      swe_get_planet_name(planet_id, name);
      to_lowercase(name);
      break;
  }
}

// DMS function removed - no longer needed for simplified output

#if USECASE == OFFLINE
EMSCRIPTEN_KEEPALIVE
#endif
const char *astro(int year, int month, int day, int hour, int minute, double longitude, double latitude, char *iHouse)
{
  char snam[40], serr[AS_MAXCH];
  double jut = 0.0;
  double tjd_ut, x[6];
  double cusp[12 + 1];
  double ascmc[10];
  long iflag, iflagret;
  int p, i;
  int32 buflen = 50000; // Reduced buffer size since we're generating less data
  char *Buffer = malloc(buflen);
  int length = 0;
  int first_planet = 1;

  iflag = SEFLG_MOSEPH | SEFLG_SPEED;

  jut = (double)hour + (double)minute / 60.0;
  tjd_ut = swe_julday(year, month, day, jut, SE_GREG_CAL);

  // Start JSON output with simplified structure
  length += snprintf(Buffer + length, buflen - length, "{ ");
  length += snprintf(Buffer + length, buflen - length, "\"jd_ut\": %f, ", tjd_ut);
  length += snprintf(Buffer + length, buflen - length, "\"planets\": [");

  // Process planets with simplified output
  for (p = SE_SUN; p <= SE_MEAN_NODE; p++)
  {
    if (p == SE_EARTH)
      continue;

    iflagret = swe_calc_ut(tjd_ut, p, iflag, x, serr);

    if (iflagret > 0 && (iflagret & SEFLG_MOSEPH))
    {
      // Add comma separator for all planets except the first
      if (!first_planet) {
        length += snprintf(Buffer + length, buflen - length, ", ");
      }
      first_planet = 0;

      get_planet_name_lower(p, snam);
      
      // Determine if planet is retrograde (speed < 0)
      int is_retro = (x[3] < 0.0) ? 1 : 0;
      
      length += snprintf(Buffer + length, buflen - length,
                         "{\"name\": \"%s\", \"long\": %f, \"retro\": %s}", 
                         snam, x[0], is_retro ? "true" : "false");
    }
  }

  length += snprintf(Buffer + length, buflen - length, "], ");

  // Calculate houses and ascmc
  swe_houses_ex(tjd_ut, iflag, latitude, longitude, (int)*iHouse, cusp, ascmc);
  
  // Add asc and mc as simple numbers
  length += snprintf(Buffer + length, buflen - length, "\"asc\": %f, ", ascmc[0]);
  length += snprintf(Buffer + length, buflen - length, "\"mc\": %f, ", ascmc[1]);

  // Add houses as simple array of longitude values
  length += snprintf(Buffer + length, buflen - length, "\"houses\": [");
  for (i = 1; i <= 12; i++)
  {
    if (i > 1) {
      length += snprintf(Buffer + length, buflen - length, ", ");
    }
    length += snprintf(Buffer + length, buflen - length, "%f", cusp[i]);
  }
  length += snprintf(Buffer + length, buflen - length, "]}");
  
  return Buffer;
}

