/**
 * models/_default-data.js
 *
 * Default initalization data for lib/db-init.js
 *
 * todo: implement the initialisation from JSON file.
 *
 * @author Villem Alango <villem.alango@gmail.com>
 * @created 14.08.15 14:57
 */

'use strict';

//  NB: the 'dummy...' fields are here for initializer testing only
// and will not be written into DB unless they are really in the model!

module.exports = [
  {
    entity: 'User',
    data:   {
      email:     'gabrielm.doe@gmail.com',
      password:  'password',
      firstName: 'Gabriel Maria',
      lastName:  'Doe',
      profile:   {
        country: 'EE',
        gender:  'M',
        phone:   '003725111111'
      }
    }
  },
  {
    entity: 'User',
    data:   {
      email:            'tuuli@yo.com',
      password:         'tuuli'
    }
  },
  {
    entity: 'User',
    data:   {
      dummyPreviusId:   '$User._id',
      dummyPreviusDate: '$User.created',
      email:            'xgabrielm.doe@gmail.com',
      password:         'password'
    }
  },
  {
    entity: 'User',
    data:   {
      email:        'ygabrielm.doe@gmail.com',
      dummyIllegal: 'sh*t',
      password:     'password'
    }
  }
];
