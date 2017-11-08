package com.realcommerce.fuseweb.app.entities.umb;

import java.util.Date;
import java.util.List;

public class MessageHeader {
	private MessageTypeEnum type;
	private String id;
	private ContactHeader sender;
	private String account;
	private List<ContactHeader> recipients;
	private String subject;
	private Date receivedDate;
	private Boolean read;
	private Boolean hasAttachments;
	private MessageSourceEnum source;
	private Boolean important;
	private Folder folder;
	private Boolean draft;
	private Boolean sent;
	private Boolean inbox;
	private Boolean spam;
	private Boolean trash;
	
	
	public MessageTypeEnum getType() {
		return type;
	}
	public void setType(MessageTypeEnum type) {
		this.type = type;
	}
	public String getId() {
		return id;
	}
	public void setId(String id) {
		this.id = id;
	}
	public ContactHeader getSender() {
		return sender;
	}
	public void setSender(ContactHeader sender) {
		this.sender = sender;
	}
	public String getAccount() {
		return account;
	}
	public void setAccount(String account) {
		this.account = account;
	}
	public List<ContactHeader> getRecipients() {
		return recipients;
	}
	public void setRecipients(List<ContactHeader> recipients) {
		this.recipients = recipients;
	}
	public String getSubject() {
		return subject;
	}
	public void setSubject(String subject) {
		this.subject = subject;
	}
	public Date getReceivedDate() {
		return receivedDate;
	}
	public void setReceivedDate(Date receivedDate) {
		this.receivedDate = receivedDate;
	}
	public Boolean isRead() {
		return read;
	}
	public void setRead(Boolean read) {
		this.read = read;
	}
	public Boolean isHasAttachments() {
		return hasAttachments;
	}
	public void setHasAttachments(Boolean hasAttachments) {
		this.hasAttachments = hasAttachments;
	}
	public MessageSourceEnum getSource() {
		return source;
	}
	public void setSource(MessageSourceEnum source) {
		this.source = source;
	}
	public Boolean isImportant() {
		return important;
	}
	public void setImportant(Boolean important) {
		this.important = important;
	}
	public Folder getFolder() {
		return folder;
	}
	public void setFolder(Folder folder) {
		this.folder = folder;
	}
	public Boolean isDraft() {
		return draft;
	}
	public void setDraft(Boolean draft) {
		this.draft = draft;
	}
	public Boolean isSent() {
		return sent;
	}
	public void isSent(Boolean sent) {
		this.sent = sent;
	}
	public Boolean isInbox() {
		return inbox;
	}
	public void setInbox(Boolean inbox) {
		this.inbox = inbox;
	}
	public Boolean isSpam() {
		return spam;
	}
	public void setSpam(Boolean spam) {
		this.spam = spam;
	}
	public Boolean isTrash() {
		return trash;
	}
	public void setTrash(Boolean trash) {
		this.trash = trash;
	}
	
	
}
