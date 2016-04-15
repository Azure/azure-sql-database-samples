{
  'targets': [
    {
      'target_name': 'sqlserver',

      'sources': [ 
        'src/Column.cpp',
        'src/Connection.cpp',
        'src/OdbcConnection.cpp',
        'src/OdbcError.cpp',
        'src/OdbcOperation.cpp',
        'src/ResultSet.cpp',
        'src/stdafx.cpp',
        'src/Utility.cpp',
      ],

      'include_dirs': [
        'src',
      ],

      'conditions': [
        [ 'OS=="win"', {
          'defines': [
            'UNICODE=1',
            '_UNICODE=1',
            '_SQLNCLI_ODBC_',
          ],
          }
        ]
      ]
    }
  ]
}


