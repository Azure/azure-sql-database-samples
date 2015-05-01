//---------------------------------------------------------------------------------------------------------------------------------
// File: Column.cpp
// Contents: Column objects from SQL Server to return as Javascript types
// 
// Copyright Microsoft Corporation and contributors
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
//
// You may obtain a copy of the License at:
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//---------------------------------------------------------------------------------------------------------------------------------

#include "stdafx.h"
#include "Column.h"

namespace mssql {

namespace {

const int64_t MS_PER_SECOND      = 1000;
const int64_t MS_PER_MINUTE      = 60 * MS_PER_SECOND;
const int64_t MS_PER_HOUR        = 60 * MS_PER_MINUTE;
const int64_t MS_PER_DAY         = 24 * MS_PER_HOUR;

inline bool is_leap_year( int64_t year )
{
    return (( year % 4 == 0 ) && ( year % 100 != 0 ) || ( year % 400 ) == 0 );
}

}

// return the number of days since Jan 1, 1970
double TimestampColumn::DaysSinceEpoch( SQLSMALLINT y, SQLUSMALLINT m, SQLUSMALLINT d )
{
    // table derived from ECMA 262 15.9.1.4
    static const double days_in_months[] = { 0.0, 31.0, 59.0, 90.0, 120.0, 151.0, 181.0, 212.0, 243.0, 273.0, 304.0, 334.0 };

    double days;

    // calculate the number of days to the start of the year
    days = 365.0 * (y-1970.0) + floor((y-1969.0)/4.0) - floor((y-1901.0)/100.0) + floor((y-1601.0)/400.0);

    // add in the number of days from the month
    days += days_in_months[ m - 1 ];

    // and finally add in the day from the date to the number of days elapsed
    days += d - 1.0;

    // account for leap year this year (affects days after Feb. 29)
    if( is_leap_year( y ) && m > 2 ) {
        days += 1.0;
    }

    return (double) floor( days );
}

// derived from ECMA 262 15.9
void TimestampColumn::MillisecondsFromDate( SQL_SS_TIMESTAMPOFFSET_STRUCT const& timeStruct )
{
    double ms = DaysSinceEpoch( timeStruct.year, timeStruct.month, timeStruct.day );
    ms *= MS_PER_DAY;

    // add in the hour, day minute, second and millisecond
    // TODO: How to handle the loss of precision from the datetimeoffset fields?
    ms += timeStruct.hour * MS_PER_HOUR + timeStruct.minute * MS_PER_MINUTE + timeStruct.second * MS_PER_SECOND;
    ms += timeStruct.fraction / NANOSECONDS_PER_MS;    // fraction is in nanoseconds

    // handle timezone adjustment to UTC
    ms += timeStruct.timezone_hour * MS_PER_HOUR;
    ms += timeStruct.timezone_minute * MS_PER_MINUTE;

    milliseconds = ms;

    nanoseconds_delta = timeStruct.fraction % NANOSECONDS_PER_MS;
}

int64_t TimestampColumn::YearFromDay( int64_t& day )
{
    int64_t year = 1970;
    int64_t days_in_year = 365;
    
    if( day >= 0 ) {
        while( day >= days_in_year ) {

            day -= days_in_year;
            ++year;
            if( is_leap_year( year )) {
                days_in_year = 366;
            }
            else {
                days_in_year = 365;
            }
        }
    }
    else {

        while( day <= -days_in_year ) {

            day += days_in_year;
            --year;
            if( is_leap_year( year - 1 )) {
                days_in_year = 366;
            }
            else {
                days_in_year = 365;
            }
        }

        if( day <= 0 ) {
            --year;
            day += days_in_year - 1;
        }
	}

    return year;
}

// calculate the individual components of a date from the total milliseconds
// since Jan 1, 1970.  Dates before 1970 are represented as negative numbers.
void TimestampColumn::DateFromMilliseconds( SQL_SS_TIMESTAMPOFFSET_STRUCT& date )
{
    static const int64_t days_in_months[] = { 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 };
    static const int64_t leap_days_in_months[] = { 31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 };

    int64_t const* start_days = days_in_months;

    // calculate the number of days elapsed (normalized from the beginning of supported datetime)
    int64_t day = static_cast<int64_t>( milliseconds ) / MS_PER_DAY;

    // how many leap years have passed since that time?
    int64_t year = YearFromDay( day );

    if( is_leap_year( year )) {
        start_days = leap_days_in_months;
    }
    
    int64_t month = 0;
    while( day >= start_days[ month ] ) {
        day -= start_days[ month ];
        ++month;
    }
    assert( month >= 0 && month <= 11 );
    assert( day >= 0 && day <= 30 );

    date.year = static_cast<SQLSMALLINT>( year );
    date.month = static_cast<SQLUSMALLINT>( month + 1 );
    date.day = static_cast<SQLUSMALLINT>( day + 1 );

    // calculate time portion of the timestamp
    int64_t time = static_cast<int64_t>( milliseconds ) % MS_PER_DAY;
    if( time < 0 ) {
        time = MS_PER_DAY + time;
    }
    // SQL Server has 100 nanosecond resolution, so we adjust the milliseconds to high bits
    date.hour = time / MS_PER_HOUR;
    date.minute = (time % MS_PER_HOUR) / MS_PER_MINUTE;
    date.second = (time % MS_PER_MINUTE) / MS_PER_SECOND;
    date.fraction = ( time % 1000 ) * NANOSECONDS_PER_MS;
    date.timezone_hour = 0;
    date.timezone_minute = 0;
}

}   // namespace mssql