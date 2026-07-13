const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const testRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'okxe-chat-test-'));
process.env.OKXE_DATA_DIR = testRoot;
const db = require(path.join(__dirname, '..', 'db.js'));

try {
  const users = db.listUsers();
  const customer = users.find((user) => user.role === 'customer');
  const staff = users.find((user) => user.role === 'staff');
  assert.ok(customer && staff, 'Cần dữ liệu demo khách hàng và nhân viên');

  const created = db.createConversation({
    userId: customer.id,
    subject: 'Kiểm thử hỗ trợ xe',
    contextType: 'general',
    content: 'Cửa hàng tư vấn giúp tôi mẫu xe phù hợp.'
  });
  assert.equal(created.conversation.userId, customer.id);
  assert.equal(created.message.senderRole, 'customer');
  assert.equal(db.listConversationsByUser(customer.id)[0].id, created.conversation.id);
  assert.ok(db.listAdminConversations().find((item) => item.id === created.conversation.id).unreadCount > 0);

  const assigned = db.assignConversation(created.conversation.id, staff.id);
  assert.equal(assigned.status, 'in_progress');
  assert.equal(assigned.assignedUserId, staff.id);

  const reply = db.createConversationMessage(created.conversation.id, staff, 'OkXe đã nhận yêu cầu và sẽ tư vấn ngay.');
  assert.equal(reply.senderRole, 'staff');
  assert.equal(db.listConversationMessages(created.conversation.id).length, 2);
  assert.ok(db.listConversationsByUser(customer.id)[0].unreadCount > 0);

  db.markConversationRead(created.conversation.id, 'customer');
  assert.equal(db.listConversationsByUser(customer.id)[0].unreadCount, 0);
  assert.equal(db.updateConversationStatus(created.conversation.id, 'closed').status, 'closed');
  db.createConversationMessage(created.conversation.id, customer, 'Tôi cần hỏi thêm một thông tin.');
  assert.equal(db.getConversationById(created.conversation.id).status, 'open');
  process.stdout.write('Chat workflow tests passed.\n');
} finally {
  db.closeDatabase();
  fs.rmSync(testRoot, { recursive: true, force: true });
}
