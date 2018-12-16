const admin = require('firebase-admin');

admin.initializeApp();

const db = admin.database();

const projectsDb = db.ref('projects');

const projectsQuery = async () => {
  const result = await projectsDb.orderByKey()
    .once('value', async (snap) => await snap.val());
  return result;
}

const checkedOut = (startDate, endDate) => {
  return (new Date() >= new Date(startDate) && new Date() <= new Date(endDate))
}

const checkedIn = (endDate) => (new Date() > new Date(endDate))


const onHold = (startDate) => (new Date() < new Date(startDate))

const setProjectItemState = async (message)  => {
  console.log(message)
  const project = await projectsQuery()
  const getProjects = project;
  
  await getProjects.forEach(child => {
    const { name, deleted_at, startDate, endDate, street, suburb, status, } = child.val()
    
    const itemValues= {
      project_name: name,
      street,
      suburb,
      status,
      startDate,
      endDate,
    };
    
    switch (true) {
      case deleted_at === undefined && checkedOut(startDate, endDate): {
        const checkedOutItems = child.val().items;
        projectsDb
          .child(child.key)
          .child('status')
          .set('CHECKED_OUT');
        checkedOutItems && Object.keys(checkedOutItems).map(async id => {
            const currValue = await db.ref(`items/${id}`).once('value');
            db.ref(`items/${id}`).set({
              ...currValue.val(),
              ...itemValues
            });
            
            db.ref(`items/${id}`).child('projects').child(child.key).set(true)
        });
        break;
      }

      case deleted_at === undefined && checkedIn(endDate): {
        const checkedInItems = child.val().items;
        projectsDb
          .child(child.key)
          .child('status')
          .set('CHECKED_IN');
        checkedInItems && Object.keys(checkedInItems).map(async id => {
            const currValue = await db.ref(`items/${id}`).once('value');
            await db.ref(`items/${id}`).set({
              ...currValue.val(),
              ...itemValues
            });

            db.ref(`items/${id}`).child('projects').child(child.key).set(true);
        });
        break;
      }

      case deleted_at === undefined && onHold(startDate): {
        const onHoldItems = child.val().items;
        projectsDb
          .child(child.key)
          .child('status')
          .set('ON_HOLD');
          onHoldItems && Object.keys(onHoldItems)
          .map(async id => {
            const currValue = await db.ref(`items/${id}`).once('value');
            await db.ref(`items/${id}`).set({
              ...currValue.val(),
              ...itemValues
            });
            db.ref(`items/${id}`).child('projects').child(child.key).set(true);
        });
        break;
      }

      case deleted_at !== undefined: {
        projectsDb
          .child(child.key)
          .child('status')
          .set('ARCHIVED');
        const resetItems = child.val().items
        
        resetItems && Object.keys(resetItems).map(async id => {
          const itemDetails = await db.ref(`items/${id}`).once('value');
          const { projectsCount, itemCount } = itemDetails.val();
          const curr_count = projectsCount ? Number(projectsCount) : 0;
          const curr_itemcount = itemCount ? Number(itemCount): 0;
          db.ref(`items/${id}`).child('itemCount').set(curr_count + curr_itemcount);
          db.ref(`items/${id}`).child('projectsCount').set(0);
          db.ref(`items/${id}`).child('projects').child(child.key).set(null);
        });
        break;
      }

      default: {
        return
      }
    }
    return
  });
}

module.exports = setProjectItemState