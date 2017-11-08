<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<!DOCTYPE html>
<html>

	<head>
	
		<title>User Details</title> 
		<script>
			var BASE_URL = '${pageContext.request.contextPath}';
		</script>
		<script src='${pageContext.request.contextPath}/resources/usersModule_sh/js/jquery-1.7.2.min.js'></script>
		<script src='${pageContext.request.contextPath}/resources/usersModule_sh/js/userDetails.js'></script>
		<c:url value="/" var="baseURL" />
		<c:url value="/resources" var="resourcesURL" />
		<link rel="stylesheet" type="text/css" href="${pageContext.request.contextPath}/resources/usersModule_sh/css/userDetails.css">
		<link rel="stylesheet" type="text/css" href="${pageContext.request.contextPath}/resources/usersModule_sh/css/jquery.ui.theme.css" />
	</head>
	
	<body >
			<div id='udContainer' class='borderBlue bgWhite'>
				<div id='udHeader'>
					<div id='udPresenceImg' class='floatLeft'></div>
					<div id='udProfileImg' class='floatLeft userImage'>
						
					</div>
					<div id='headerText' class='floatLeft'>
						<div id='udFuseIdTitle' class='floatLeft smallMarginLeft textVal'>Fuse ID:</div>
						<div id='udFuseIdVal' class='floatLeft headerValue smallMarginLeft textVal'></div>
						<div id='udFuseNameTitle' class='floatLeft smallMarginLeft textVal'>Name:</div>
						<div id='udFuseNameVal' class='floatLeft headerValue smallMarginLeft textVal'></div>		
					</div>
					<div id='udPrint' class='floatRight'></div>
					<div id='udReload' class='floatRight'></div>
				</div>
				<div class='clearFloat'></div>
				<hr class='headerHr'/>			
				<div id='udBody' class='<%= request.getSession().getAttribute("contactId")%>'>
					<div id='udLeft' class='floatLeft'>
						<div id='udGeneral'>
							<div id='udGeneralTitle' class='udTitle'>
								General Details:
							</div>
							<hr/>
							<div id='udGeneralDetailsContainer' class='innerContent'>
								<div id='udFuseIdLine' class='generalLine'>
									<div id='udFuseIdLineTitle ' class='floatLeft udInnerTitles'>
										Fuse ID:
									</div>
									<div id='udFuseIdLineVal' class='heavyBlueBorder floatLeft udInnerText textVal' >
										
									</div>
								</div>
								<div class='clearFloat'></div>
								<div id='udExternalIdLine' class='generalLine' >
									<div id='udExternalIdLineTitle' class='floatLeft udInnerTitles'>
										External ID:
									</div>
									<div id='udExternalIdLineVal' class='heavyBlueBorder floatLeft udInnerText textVal'>
										
									</div>
								</div>
								<div class='clearFloat'></div>
								<div id='udStatusLine' class='generalLine' >
									<div id='udStatusLineTitle' class='floatLeft udInnerTitles'>
										Status:
									</div>
									<div id='udStatusLineVal' class='heavyBlueBorder floatLeft udInnerText textVal'>
										
									</div>
								</div>
								<div class='clearFloat'></div>
							</div>
						</div>
						<div id='udAccounts'>
							<div id='udAccountsTitle' class='udTitle'>
								Accounts:
							</div>
							<hr/>
							<div id='udAccountsDetails'>
								<div id='udAccountsHeader'>
									<div id='udAccountsType' class='udAccountLineLeft floatLeft udAccountTypeTitle textVal'>Type:</div>
									<div id='udAccountsID' class='udAccountLineCenter floatLeft udAccountIdTitle textVal'>ID:</div>
									<div id='udAccountsStatus' class='udAccountLineRight floatLeft udAccountStatusTitle textVal'>Status:</div>
								</div>
								<div class='clearFloat'></div>
								<div id='udAccountsBody' class='innerContent'>
								<!-- generate dynamiclly -->

									<div class='clearFloat'></div>
								</div>
							</div>
						</div>
						<div id='udClients'>
							<div id='udClientsTitle' class='udTitle'>
								Clients:
							</div>
							<hr/>
							<div id='udClientsDetails'>
								<div id='udClientsHeader'>
									<div id='udClientsType' class='textVal floatLeft udClientLineLeft'>Type:</div>
									<div id='udClientsID' class='textVal floatLeft udClientLineLeftCenter udClientOs'>OS:</div>
									<div id='udClientsStatus' class='textVal floatLeft udClientLineCenter udClientStatus'>Status:</div>
									<div id='udClientAppVer' class='textVal floatLeft udClientLineRight udClientVer'>App Ver:</div>
								</div>
								<div class='clearFloat'></div>
								<div id='udClientsBody' class='innerContent'>
								<!-- generate dynamiclly -->
									
								</div>
							</div>
						</div>
					</div>
				
					<div id='udRight' class='floatLeft'>
						<div id='udCos'>
							<div id='udCosTitle' class='udTitle'>
								Class of service:
							</div>
							<hr/>
							<div id='udCosDetailsContainer' class='innerContent'>
								<div id='udTypeLine' class='generalLine'>
									<div id='udTypeLineTitle' class='udInnerTitles floatLeft'>
										Type:
									</div>
									<div id='udTypeLineVal' class='heavyBlueBorder udInnerText floatLeft textVal'>
									</div>
								</div>
								<div id='udSourceLine' class='generalLine'>
									<div id='udSourceLineTitle' class='udInnerTitles floatLeft'>
										Source:
									</div>
									<div id='udSourceLineVal' class='heavyBlueBorder udInnerText floatLeft textVal'>
									</div>
								</div>
								<div id='udStartDateLine' class='generalLine'>
									<div id='udStartDateLineLineTitle' class='udInnerTitles floatLeft'>
										Subscription start date:
									</div>
									<div id='udStartDateLineVal' class='heavyBlueBorder udInnerText floatLeft textVal'>
										
									</div>
								</div>
								<div id='udEndDateLine' class='generalLine'>
									<div id='udEndDateLineLineTitle' class='udInnerTitles floatLeft'>
										Subscription end date:
									</div>
									<div id='udEndDateLineVal' class='heavyBlueBorder udInnerText floatLeft textVal'>
									
									</div>
								</div>
								<div class='clearFloat'></div>
							</div>
						</div>
						<div id='udActivity'>
							<div id='udActivityTitle' class='udTitle'>
								Activity:
							</div>
							<hr/>
							<div id='udActivityDetailsContainer' class='innerContent'>
								<div id='udRegDateLine' class='generalLine'>
									<div id='udRegDateLineTitle' class='udInnerTitles floatLeft'>
										Registration date:
									</div>
									<div id='udRegDateLineVal' class='heavyBlueBorder udInnerText floatLeft textVal'>
										
									</div>
								</div>
								<div id='udLastLoginLine' class='generalLine'>
									<div id='udLastLoginLineTitle' class='udInnerTitles floatLeft'>
										Last login:
									</div>
									<div id='udLastLoginLineVal' class='heavyBlueBorder udInnerText floatLeft textVal'>
										
									</div>
								</div>
								<div id='udLastActiveDateLine' class='generalLine'>
									<div id='udLastActiveLineTitle' class='udInnerTitles floatLeft'>
										Last activity:
									</div>
									<div id='udLastActiveLineVal' class='heavyBlueBorder udInnerText floatLeft textVal'>
										
									</div>
								</div>
								<div id='udActiveStatusLine' class='generalLine'>
									<div id='udActiveStatusLineTitle' class='udInnerTitles floatLeft'>
										Activity Status:
									</div>
									<div id='udActiveStatusLineVal' class='heavyBlueBorder udInnerText floatLeft textVal'>
										
									</div>
								</div>
								<div id='udActiveStatusChangeDateLine' class='generalLine'>
									<div id='udActiveStatusChangeLineTitle' class='udInnerTitles floatLeft'>
										Activity Status Change Date:
									</div>
									<div id='udActiveStatusChangeLineVal' class='heavyBlueBorder udInnerText floatLeft textVal'>
										
									</div>
								</div>
								<div id='udFacebookLine' class='generalLine'>
									<div id='udFacebookLineTitle' class='udInnerTitles floatLeft'>
										Facebook:
									</div>
									<div id='udFacebookLineVal' class='heavyBlueBorder udInnerText floatLeft textVal'>
										
									</div>
								</div>
								<div id='udTwitterLine' class='generalLine'>
									<div id='udTwitterLineTitle' class='udInnerTitles floatLeft'>
										Twitter:
									</div>
									<div id='udTwitterLineVal' class='heavyBlueBorder udInnerText floatLeft textVal'>
										
									</div>
								</div>
								<div class='clearFloat'></div>
							</div>
						</div>
					</div>
				</div>
				
			</div>
	</body>

	
</html>