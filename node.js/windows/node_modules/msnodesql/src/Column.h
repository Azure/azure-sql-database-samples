//---------------------------------------------------------------------------------------------------------------------------------
// File: Column.h
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

#pragma once

namespace mssql
{
    using namespace std;

    class Column
    {
    public:
        virtual Handle<Value> ToValue() = 0;
        virtual bool More() const { return false; }
    };

    class StringColumn : public Column
    {
    public:

        typedef std::vector<uint16_t> StringValue;

        StringColumn( unique_ptr<StringValue>& text, bool more ) :
            more(more) 
        {
            swap( this->text, text );
        }

        Handle<Value> ToValue()
        {
            HandleScope scope;

            return scope.Close(String::New( text->data(), text->size() ));
        }

        bool More() const { return more; }

    private:

        unique_ptr<StringValue> text;
        bool more;
    };
    
    class BinaryColumn : public Column
    {
    public:
        BinaryColumn(vector<char>& src, bool more)
            : more(more)
        {
            buffer = move(src);
        }
        Handle<Value> ToValue()
        {
            HandleScope scope;
            
            int length = buffer.size();

            char* destination = new char[length];

            memcpy(destination, buffer.data(), length);

            return scope.Close(node::Buffer::New(destination, length, deleteBuffer, nullptr)->handle_);
        }
        bool More() const { return more; }
        
        static void deleteBuffer(char* ptr, void* hint)
        {
            delete[] ptr;
        }

    private:
        vector<char> buffer;
        bool more;
    };

    class IntColumn : public Column
    {
    public:
        IntColumn(long value) : value(value) {}
        Handle<Value> ToValue()
        {
            HandleScope scope;
            return scope.Close(Integer::New(value));
        }

    private:
       int value;
    };

    class NullColumn : public Column
    {
    public:
       Handle<Value> ToValue()
       {
           HandleScope scope;
           return scope.Close(Null());
       }
    };

    class NumberColumn : public Column
    {
    public:
        NumberColumn(double value) : value(value) {}
        Handle<Value> ToValue()

        {
           HandleScope scope;
           return scope.Close(Number::New(value));
        }

    private:
        double value;
    };

    // Timestamps return dates in UTC timezone
    class TimestampColumn : public Column 
    {
    public:

        TimestampColumn( SQL_SS_TIMESTAMPOFFSET_STRUCT const& timeStruct )
        {
            MillisecondsFromDate( timeStruct );
        }

        TimestampColumn( double ms, int32_t delta = 0 ) :
            milliseconds( ms ),
            nanoseconds_delta( delta )
        {
        }

        Handle<Value> ToValue()
        {
            HandleScope scope;

            Local<Date> date = Local<Date>::Cast( Date::New( milliseconds ));

            // include the properties for items in a DATETIMEOFFSET that are not included in a JS Date object
            date->Set( String::NewSymbol( "nanosecondsDelta" ), 
                       Number::New( nanoseconds_delta / ( NANOSECONDS_PER_MS * 1000.0 )));

            return scope.Close( date );
        }

        void ToTimestampOffset( SQL_SS_TIMESTAMPOFFSET_STRUCT& date )
        {
            DateFromMilliseconds( date );
        }

        static const int64_t NANOSECONDS_PER_MS = 1000000;                  // nanoseconds per millisecond

    private:

        double milliseconds;
        int32_t nanoseconds_delta;    // just the fractional part of the time passed in, not since epoch time

        // return the number of days since Jan 1, 1970
        double DaysSinceEpoch( SQLSMALLINT y, SQLUSMALLINT m, SQLUSMALLINT d );

        // derived from ECMA 262 15.9
        void MillisecondsFromDate( SQL_SS_TIMESTAMPOFFSET_STRUCT const& timeStruct );

        // return the year from the epoch time.  The remainder is returned in the day parameter
        int64_t YearFromDay( int64_t& day );

        // calculate the individual components of a date from the total milliseconds
        // since Jan 1, 1970
        void DateFromMilliseconds( SQL_SS_TIMESTAMPOFFSET_STRUCT& date );
    };

    class BoolColumn : public Column
    {
    public:
        BoolColumn( bool value) : value(value) {}
        Handle<Value> ToValue()
        {
            HandleScope scope;
            return scope.Close(Boolean::New(value));
        }
    private:
        bool value;
    };

}   // namespace mssql
