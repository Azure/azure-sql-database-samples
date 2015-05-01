//---------------------------------------------------------------------------------------------------------------------------------
// File: Utility.cpp
// Contents: Utility functions used in Microsoft Driver for Node.js for SQL Server
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

namespace mssql
{
    using namespace std;
    using namespace v8;

    wstring FromV8String(Handle<String> input)
    {
        wstring result;

        const int bufferLength = 256;
        uint16_t buffer[bufferLength];
        int length = input->Length();
        result.reserve(length);
        int read = 0;
        while (read < length)
        {
            int toread = min(bufferLength, length - read);
            int actual = input->Write(buffer, read, toread);
            result.append(reinterpret_cast<const wchar_t*>(buffer), actual);
            read += actual;
        }

        return result;
    }

    string w2a(const wchar_t* input)
    {
        vector<char> messageBuffer;
        int length = ::WideCharToMultiByte(CP_ACP, 0, input, -1, nullptr, 0, nullptr, nullptr);
        if (length > 0)
        {
            // length includes null terminator
            messageBuffer.resize(length);
            ::WideCharToMultiByte(CP_ACP, 0, input, -1, messageBuffer.data(), messageBuffer.size(), nullptr, nullptr);
        }
        return string(messageBuffer.data());
    }
}
