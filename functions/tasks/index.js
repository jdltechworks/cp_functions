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
  console.log(message);
  const project = await projectsQuery()
  const getProjects = project;
  
  await getProjects.forEach(child => {
    const { name, deleted_at, items, startDate, endDate, street, suburb, status, } = child.val()
    
    const itemValues= {
      project_name: name,
      street,
      suburb,
      status,
      startDate,
      endDate
    };

    switch (true) {
      case deleted_at === undefined && checkedOut(startDate, endDate):
        projectsDb
          .child(child.key)
          .child('status')
          .set('CHECKED_OUT');
        Object.keys(items)
          .map(async id => {
            const currValue = await db.ref(`items/${id}`).once('value');
            await db.ref(`items/${id}`).set({
              ...currValue.val(),
              ...itemValues
            });
        });
        break;
      case deleted_at === undefined && checkedIn(endDate):
        projectsDb
          .child(child.key)
          .child('status')
          .set('CHECKED_IN');
        Object.keys(items)
          .map(async id => {
            const currValue = await db.ref(`items/${id}`).once('value');
            await db.ref(`items/${id}`).set({
              ...currValue.val(),
              ...itemValues
            });
        });
        break;
      case deleted_at === undefined && onHold(startDate):
        projectsDb
          .child(child.key)
          .child('status')
          .set('ON_HOLD');
        Object.keys(items)
          .map(async id => {
            const currValue = await db.ref(`items/${id}`).once('value');
            await db.ref(`items/${id}`).set({
              ...currValue.val(),
              ...itemValues
            });
        });
          break;
      case deleted_at !== undefined:
        projectsDb
          .child(child.key)
          .child('status')
          .set('ARCHIVED');
        const project = db.ref(`projects/${child.key}`).once('value');
        const { items } = project.val();

        Object.keys(items).map(async id => {
          const itemDetails = await db.ref(`items/${id}`).once('value');
          const { project_count, item_count } = itemDetails.val();
          db.ref(`items/${id}`).set({
            item_count: project_count + item_count,
            project_count: 0,
          });
        });
        break;
      default: return null
    }
  });
}

module.exports = setProjectItemState